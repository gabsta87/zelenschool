import { Injectable } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { collection, QueryConstraint, Firestore, addDoc, collectionData, doc, setDoc, DocumentData, arrayUnion, arrayRemove, getDocs, deleteField, where, QuerySnapshot} from '@angular/fire/firestore';
import { deleteDoc, getDoc, query, updateDoc } from '@firebase/firestore';
import { filter, find, firstValueFrom, map, Observable } from 'rxjs';
import * as dayjs from 'dayjs';
import * as isBetween from 'dayjs/plugin/isBetween';
import { formatForDB, getNowDate, isColliding } from './hour-management.service';
dayjs.extend(isBetween);

@Injectable({
  providedIn:'root'
})
export class AngularfireService{
  
  constructor(
    private readonly _dbaccess:Firestore,
    private readonly _auth:Auth,
  ) { }

  private getElements(name:string,...constraint:QueryConstraint[]){
    const myCollection = collection(this._dbaccess,name);

    let data = query(myCollection,...constraint)

    const observableStream = collectionData(data, {idField: 'id'})
    return observableStream;
  }

  createCalendarEntry(newEntry: CalendarEntry){
    if(!this._auth.currentUser?.uid){
      console.log("User not logged, no event created");
      return
    }

    return addDoc(collection(this._dbaccess,"calendarEntries"),{
      ...newEntry,
      attendantsId:[],
      timeStart : formatForDB(newEntry.timeStart),
      timeEnd : formatForDB(newEntry.timeEnd),
      author:this._auth.currentUser.uid,
    });
  }

  updateCalendarEntry(newEntry: any) {
    if(!this._auth.currentUser?.uid){
      console.log("User not logged, impossible to edit event");
      return
    }
    
    return updateDoc(doc(this._dbaccess,"calendarEntries",newEntry.id),{
      ...newEntry,
      timeStart : formatForDB(newEntry.timeStart),
      timeEnd : formatForDB(newEntry.timeEnd),
      // author:this._auth.currentUser.uid,
    });
  }

  deleteCalendarEntry(entryId:string){
    // TODO add security : admin or owner of course
    if(this._auth.currentUser?.uid){
      return deleteDoc(doc(this._dbaccess,"calendarEntries",entryId))
    }else{
      console.log("User not logged, impossible to delete event");
      return;
    }
  }

  async toggleSubscribtionToCalendarEntry(eventId:string,subscribe:boolean){
    const docRef = doc(this._dbaccess,'calendarEntries/'+eventId);
    
    if(!this._auth.currentUser)
      return;

    await updateDoc(docRef, {
      attendantsId: subscribe ? arrayUnion(this._auth.currentUser?.uid) : arrayRemove(this._auth.currentUser?.uid)
    });
  }

  getCalendarEntries(){
    return this.getElements("calendarEntries");
  }

  getCalendarEntry(idToFind: string){
    // return this.getElements("calendarEntries",where(idToFind,'==','id'))
    let temp = this.getCalendarEntries();
    return temp.pipe(map(datas => datas.find(e => e['id'] === idToFind)));
  }

  getCalendarEntriesCollisions(startTime:string,endTime:string,currentEventId?:string){
    if(currentEventId){
      return this.getCalendarEntries().pipe(
        map(datas=> datas.filter(e => isColliding(startTime,endTime,e['timeStart'],e['timeEnd']) && e['id'] != currentEventId))
      )
    }else{
      return this.getCalendarEntries().pipe(
        map(datas=> datas.filter(e => isColliding(startTime,endTime,e['timeStart'],e['timeEnd'])))
      )
    }
  }

  getUsers(){
    return this.getElements("users");
  }

  async getUser(userId:string):Promise<DocumentData|undefined>{
    let temp = await firstValueFrom(this.getUsers());
    return temp.find(e => e['id'] === userId);
  }

  banUser(userId:string,message="SYSTEM : missed too many courses"){
    const docRef = doc(this._dbaccess,'users/'+userId);
    
    const result = updateDoc(docRef,{ban:{
      authorID:this._auth.currentUser?.uid,
      date: formatForDB(dayjs(new Date())),
      comment: message,
    }})

    this.removeUserFromFutureCourses(userId);

    return result;
  }

  async removeUserFromFutureCourses(userId:string){
    let futureCourses = await firstValueFrom(this.getCalendarEntries().pipe(map( (courses:any) => courses = courses.filter((course:any) =>dayjs(course.timeStart).isAfter(dayjs(getNowDate()),"hour") ))) )
    
    futureCourses.forEach( (course:any)=> this.removeUserFromCourse(course['id'],userId))
  }

  removeUser(userId:string){
    this.removeUserFromCourses(userId);
    const docRef = doc(this._dbaccess,'users/'+userId);
    deleteDoc(docRef);
  }

  acceptRequest(userId:string){
    const docRef = doc(this._dbaccess,'users/'+userId);
    return updateDoc(docRef,{status:"teacher"});
  }

  async unbanUser(userId:string){
    const docRef = doc(this._dbaccess,'users/'+userId);
    return updateDoc(docRef,{ban:deleteField()});
  }

  async toggleUserAbsent(value: boolean, userId: string, courseId: string) {
    const docRef = doc(this._dbaccess,'users/'+userId);

    await updateDoc(docRef, {
      missedCourses: value ? arrayUnion(courseId) : arrayRemove(courseId)
    });

    const getR = await getDoc(docRef);

    const missed = getR.data();
    let size = 0
    if(missed)
      size = missed['missedCourses'].length

    // Too many missed courses, the user is banned
    if(size >= 3){
      updateDoc(docRef, { missedCourses: null });
      this.banUser(userId)
    }
  }

  private async removeUserFromCourses(userId:string){
    const coll = getDocs(collection(this._dbaccess,"calendarEntries"));

    (await coll).forEach((doc:any) => {
      this.removeUserFromCourse(doc.id,userId);
    })
  }

  async removeUserFromCourse(eventId:string,userId:string){
    const docRef = doc(this._dbaccess,'calendarEntries/'+eventId);
    // TODO if (past course) return
    // if(query(docRef.)

    await updateDoc(docRef, {
      attendantsId: arrayRemove(userId)
    });
  }

  getUserObs(userId:string):Observable<DocumentData | undefined>{
    let tempObs = this.getUsers();
    return tempObs.pipe(map(datas => datas.find(e => e['id'] === userId)));
  }

  // Modifies current user infos
  setUser(param:UserInfos) {
    const docRef = doc(this._dbaccess,'users/'+this._auth.currentUser?.uid);
    return setDoc(docRef,{...param});
    // return setDoc(docRef,{f_name:param.f_name,l_name:param.l_name,birthday:param.birthday,email:param.email,phone:param.phone,s_permit_id:param.s_permit_id,address:param.address});
  }

  // Updates current user infos
  updateUser(newValue:any){
    const docRef = doc(this._dbaccess,'users/'+this._auth.currentUser?.uid);
    return updateDoc(docRef,newValue);
  }

  createImageEntry(newImage:any){
    // TODO remove
    return addDoc(collection(this._dbaccess,"images"),{
      ...newImage,
      uploadedBy:this._auth.currentUser?.uid
    })
  }

  getArticles(){
    return firstValueFrom(this.getElements("articles"));
  }

  async createUser(newUser:User){
    let userId = newUser.uid;
    let userStored = await this.getUser(userId);

    // If the user already exists, return undefined : nothing created
    if(userStored){
      return undefined;
    }
    
    // Otherwise, returns reference to doc created
    return doc(this._dbaccess,'users/'+userId);
  }

  async addAssoMember(e: {name: string, photo: string, role: string, link?: undefined, }){
    return addDoc(collection(this._dbaccess,"assoMembers"),{
      ...e
    })
  }

  deleteAssoMember(id:string){
    const docRef = doc(this._dbaccess,'assoMembers/'+id);
    deleteDoc(docRef);
  }

  updateAssoMember(newValue:AssoMember){
    const docRef = doc(this._dbaccess,'assoMembers/'+newValue.id);
    return updateDoc(docRef,{name : newValue.name, role:newValue.role, photo : newValue.photo, link : newValue.link});
  }

  getAssoMembers(){
    return this.getElements("assoMembers");
  }

  getAssoMember(id:string){
    return this.getAssoMembers().pipe(find((e:any) => e.id === id));
  }

  getPartners(){
    return this.getElements("partners");
  }

  writePartner(newEntry : {logoName:string,link:string}){
    return addDoc(collection(this._dbaccess,"partners"),{
      ...newEntry
    })
  }

  deletePartner(id:string){
    const docRef = doc(this._dbaccess,'partners/'+id);
    deleteDoc(docRef);
  }

  updatePartner(partner: { id: string; link: string; logoName: string }) {
    const docRef = doc(this._dbaccess,'partners/'+partner.id);
    return updateDoc(docRef,{link : partner.link, logoName : partner.logoName});
  }

  // Rooms management
  getRooms(){
    return this.getElements("rooms");
  }

  updateRoom(room : {id: string, name: string, maxStudents: number}){
    if(!room.id){
      return addDoc(collection(this._dbaccess,"rooms"),{ name: room.name, maxStudents: room.maxStudents })
    }else{
      const docRef = doc(this._dbaccess,'rooms/'+room.id);
      return updateDoc(docRef,{name : room.name, maxStudents : room.maxStudents});
    }
  }

  deleteRoom(id:string){
    const docRef = doc(this._dbaccess,'rooms/'+id);
    deleteDoc(docRef);
  }

  // Galleries Management

  getGalleries(){
    return this.getElements("galleries");
  }

  createGallery(name:string){
    return addDoc(collection(this._dbaccess,"galleries"),{name:name})
  }

  // async addAssoMember(e: {name: string, photo: string, role: string, link?: undefined, }){
  addImage(data:{collection:string, link:string, name:string}){
    const completedData = {...data, uploadDate : getNowDate(), uploaderId:this._auth.currentUser?.uid}

    return addDoc(collection(this._dbaccess,"images"),{
      ...completedData
    })
  }

  async deleteGallery(id:string){

    const imageCollection = collection(this._dbaccess, "images");
    const imageQuery = query(imageCollection, where("collection", "==", id));
    const imageDocs = await getDocs(imageQuery);
    imageDocs.forEach(doc => deleteDoc(doc.ref));

    const docRef = doc(this._dbaccess,'galleries/'+id);
    deleteDoc(docRef);
  }

  deleteImage(id:string){
    const docRef = doc(this._dbaccess,'images/'+id);
    deleteDoc(docRef);
  }

  getGalleryImages(id:string){
    const result = this.getElements("images",where("collection","==",id));
    return result;
  }

  //  // Temporary Code
  
  // initGallery(){
  //   this.originImages.forEach((e:string) => {
  //     addDoc(collection(this._dbaccess,"images"),{
  //       link:e,
  //       collection:"c05cRgdx9rUSc8ZFOGnB",
  //       uploaderId:"0ZT4oOgFtGch8ZSweijWrZp31PB3",
  //       uploadDate:"12.04.2023",
  //     })
  //   })
  // }

  // originImages = [
  //   "/assets/images/IMG-20220627-WA0016.jpg",
  //   "/assets/images/IMG-20220729-WA0043.jpg",
  //   "/assets/images/IMG-20220627-WA0045.jpg",
  //   "/assets/images/IMG-20220730-WA0006.jpg",
  //   "/assets/images/IMG-20220627-WA0049.jpg",
  //   "/assets/images/IMG-20220628-WA0028.jpg",
  //   "/assets/images/IMG-20220707-WA0014.jpg",
  //   "/assets/images/IMG-20220712-WA0003.jpg",
  //   "/assets/images/IMG-20220722-WA0003.jpg",
  //   "/assets/images/IMG-20220729-WA0041.jpg",
  //   "/assets/images/IMG-20220725-WA0018-1.jpg",
  //   "/assets/images/IMG_20220811_120348_463.jpg",
  //   "/assets/images/IMG_20220811_120319_583.jpg",
  //   "/assets/images/IMG_20220607_113736_327.jpg",
  //   "/assets/images/IMG_20220811_114818_117.jpg",
  //   "/assets/images/IMG_20220811_120150_093.jpg",
  //   "/assets/images/IMG_20220811_120158_143.jpg",
  //   "/assets/images/IMG_20220811_120249_968.jpg",
  //   "/assets/images/IMG_20220811_120328_275.jpg",
  //   "/assets/images/photo_2022-08-25_09-09-24.jpg",
  //   "/assets/images/WhatsApp-Image-2022-04-30-at-2.19.37-PM.jpeg",
  //   "/assets/images/WhatsApp-Image-2022-04-30-at-3.11.32-PM.jpeg",
  //   "/assets/images/WhatsApp-Image-2022-05-02-at-10.27.42-AM.jpeg",
  //   "/assets/images/WhatsApp-Image-2022-08-14-at-11.46.56-AM.jpeg",
  //   "/assets/images/WhatsApp-Image-2022-08-14-at-11.52.07-AM.jpeg",
  // ]
}

export interface UserInfos {
  f_name:string,
  l_name:string,
  email:string,
  status:string,
  phone?:string|undefined|null,
  birthday?:string|undefined|null,
  s_permit_id?:string|undefined|null,
  address?:string|undefined|null,
  ban?:{author:string,comment:string,date:string}|undefined|null,
  missedCourses?:{courseId:string}|undefined|null,
}

export interface CalendarEntry{
  title:string,
  timeStart:string,
  timeEnd:string,
  room_id:string,
  max_participants:number,
  description:string,
  attendantsId?:string[],
  author?:string,
  id?:string,
}

export interface AssoMember{
  id?:string,
  role:string,
  name:string,
  link?:string,
  photo?:string
}

