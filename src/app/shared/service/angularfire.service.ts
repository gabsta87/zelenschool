import { Injectable } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { DocumentData, Firestore, QueryConstraint, addDoc, arrayRemove, arrayUnion, collection, collectionData, deleteField, doc, getDocs, setDoc, where } from '@angular/fire/firestore';
import { deleteDoc, getDoc, query, updateDoc } from '@firebase/firestore';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { deleteUser, getAuth } from 'firebase/auth';
import { Observable, find, firstValueFrom, map, switchMap } from 'rxjs';
import { formatForDB, getNowDate, isColliding } from './hour-management.service';
dayjs.extend(isBetween);
import firebase from 'firebase/app';

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

  async getSnapshot(collection:string,documentId:string):Promise<DocumentData|undefined>{
    const docRef = doc(this._dbaccess, collection, documentId);
    const docSnap = await getDoc(docRef);
    return docSnap.data() ? {...docSnap.data(),id:documentId}: undefined;
  }

  // Calendar Entries

  createCalendarEntry(newEntry: CalendarEntry){
    if(!this._auth.currentUser?.uid){
      console.log("User not logged, no event created");
      return
    }

    return addDoc(collection(this._dbaccess,"calendarEntries"),{
      ...newEntry,
      attendantsId : [],
      timeStart : formatForDB(newEntry.timeStart),
      timeEnd : formatForDB(newEntry.timeEnd),
      author : newEntry.author ? newEntry.author : this._auth.currentUser.uid,
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

  async toggleSubscribtionToCalendarEntryForCurrentUser(eventId:string,subscribe:boolean){
    if(!this._auth.currentUser)
      return

    this.toggleSubscribtionToCalendarEntry(this._auth.currentUser?.uid,eventId,subscribe);
  }

  async toggleSubscribtionToCalendarEntry(userId:string,eventId:string,subscribe:boolean){
    const docRef = doc(this._dbaccess,'calendarEntries/'+eventId);
    
    if(!userId)
      return;

    await updateDoc(docRef, {
      attendantsId: subscribe ? arrayUnion(userId) : arrayRemove(userId)
    });
  }

  getCalendarEntries():Observable<DocumentData[]>{
    return this.getElements("calendarEntries");
  }

  getCalendarEntry(idToFind: string){
    let temp = this.getCalendarEntries();
    return temp.pipe(map((datas:any) => datas.find((e:DocumentData) => e['id'] === idToFind)));
  }

  getCalendarEntriesCollisions(startTime:string,endTime:string,currentEventId?:string){
    let result;
    if(currentEventId){
      result = this.getCalendarEntries().pipe(
        map((datas:any)=> datas.filter((e:DocumentData) => isColliding(startTime,endTime,e['timeStart'],e['timeEnd']) && e['id'] != currentEventId))
      )
    }else{
      result = this.getCalendarEntries().pipe(
        map((datas:any)=> datas.filter((e:DocumentData) => isColliding(startTime,endTime,e['timeStart'],e['timeEnd'])))
      )
    }

    // loading room infos
    result = result.pipe(switchMap(async (datas:any) => {
      // Getting room ids
      const roomsIDs = datas.map((e:any) => e.room_id)

      // getting room infos
      const roomInfos = await Promise.all(roomsIDs.map((id:string) => this.getRoom(id)))

      // putting room infos
      datas.map((evt:any) => evt.room = roomInfos.find((e:any) => e ? e.id == evt.room_id : undefined ))
      
      return datas
    }))
    return result;
  }

  // Users Management

  getUsers(){
    return this.getElements("users");
  }

  async getUser(userId:string):Promise<DocumentData|undefined>{
    // const docRef = doc(this._dbaccess, "users", userId);
    // const docSnap = await getDoc(docRef);
    // console.log("user found : ",docSnap.data());
    
    // return docSnap.data() ? {...docSnap.data(),id:userId} : undefined;

    return this.getSnapshot("users",userId);
    
    //  // Old version
    // let temp = await firstValueFrom(this.getUsers());
    // return temp.find(e => e['id'] === userId);
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

  async removeUser(userId:string){
    let value = await this.getSnapshot("users",userId);
    
    if(value){
      // If children, remove from parent children list
      if(value['parent']){
        const docRef = doc(this._dbaccess,'users/'+value['parent']);
        updateDoc(docRef, {
          children: arrayRemove(userId)
        });
      }

      // If parent, remove children
      if(value['children']){
        value['children'].forEach((child:string) => {
          this.removeUser(child);
        })
      }
    }

    this.removeUserFromCourses(userId);
    const docRef = doc(this._dbaccess,'users/'+userId);
    deleteDoc(docRef);

    let currentUser = getAuth().currentUser

    console.log(
      "user : ",currentUser
    );
    // firebase.auth().getUser(userId);

    const userToDelete = {uid:userId} as User;

    deleteUser(userToDelete).then(() => {
      console.log("user deleted");
    }).catch((error) => {
      console.log("error : ",error);
    });
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

    await updateDoc(docRef, {
      attendantsId: arrayRemove(userId)
    });
  }

  getUserObs(userId:string):Observable<DocumentData | undefined>{
    let tempObs = this.getUsers();
    let result =  tempObs.pipe(map(datas => datas.find(e => e['id'] === userId)));
    
    return result;
  }

  setUser(id:string,data:any){
    const docRef = doc(this._dbaccess,'users/'+id);
    return updateDoc(docRef,{...data});
  }

  // Updates current user infos
  updateCurrentUser(newValue:any){
    const docRef = doc(this._dbaccess,'users/'+this._auth.currentUser?.uid);
    // console.log("updating user ",this._auth.currentUser?.uid," with value ",newValue);
    
    return updateDoc(docRef,{...newValue});
  }

  async getCurrentUserLanguage():Promise<string|undefined>{
    let currentUserId = this._auth.currentUser?.uid;
    if(currentUserId){
      let userData = await this.getSnapshot("users",currentUserId);
      if(userData){
        return userData['language'];
      }else{
        return undefined;
      }
    }else{
      return undefined
    }
  }

  // Teachers specific functions

  acceptRequest(userId:string){
    const docRef = doc(this._dbaccess,'users/'+userId);
    return updateDoc(docRef,{status:"teacher"});
  }

  async getTeacherCoursesByMonth(teacherId:string){
    const courses = this.getElements("calendarEntries",where("author","==",teacherId));

    const fixedCourses = await firstValueFrom(courses);

    const groupedCourses = fixedCourses.reduce((acc, course) => {
      const month = dayjs(course['timeStart']).format("YYYY.MM");
  
      if (!acc[month]) {
        acc[month] = [];
      }
  
      acc[month].push(course);
  
      return acc;
    }, {});
  
    return groupedCourses;
  }
  
  createImageEntry(newImage:any){
    return addDoc(collection(this._dbaccess,"images"),{
      ...newImage,
      uploadedBy:this._auth.currentUser?.uid
    })
  }

  getArticles(){
    return firstValueFrom(this.getElements("articles"));
  }

  async createUser(newUser:User,
    data:{email:string,f_name:string,l_name:string,phone:string,status:string,
      birthday ? : string,
      s_permit_number ? : string,
      address ? :string,
    }){
    let userId = newUser.uid;
    let userStored = await this.getUser(userId);


    // If the user already exists, return undefined : nothing created
    if(userStored){
      return undefined;
    }
    
    setDoc(doc(this._dbaccess,'users/',userId),{
      email : data.email ? data.email : "",
      f_name: data.f_name ? data.f_name : "",
      l_name: data.l_name ? data.l_name : "",
      phone: data.phone ? data.phone : "",
      status: data.status ? data.status : "",
      birthday : data.birthday ? data.birthday : "",
      address : data.address ? data.address : "",
    });
    
    // Otherwise, returns reference to doc created
    return doc(this._dbaccess,'users/',userId);
  }

  createChild(newUser:UserInfos){
    return addDoc(collection(this._dbaccess,"users"),{...newUser})
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
    return updateDoc(docRef,{...newValue});
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
    return updateDoc(docRef,{...partner});
  }

  // Rooms management
  getRooms(){
    return this.getElements("rooms");
  }

  async getRoom(id:string){
    let tempObs = await firstValueFrom(this.getRooms());
    return tempObs.find(e => e['id'] === id);
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

  updateGallery(id:string,newName:string){
    const docRef = doc(this._dbaccess,'galleries/'+id);
    return updateDoc(docRef,{name : newName});
  }

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

  // Activities management

  async getActivities():Promise<DocumentData[]>{
    const act = await firstValueFrom(this.getElements("activities"));
    return act;
  }

  getActivitiesObs(){
    return this.getElements("activities");
  }

  createActivity(newValue : {title:string,link:string,iconName:string,description:string}){
    return addDoc(collection(this._dbaccess,"activities"),{
      title : newValue.title,
      link : newValue.link,
      iconName : newValue.iconName,
      description : newValue.description,
    })
  }

  updateActivity(newValue : {id:string,title?:string,link?:string,iconName?:string,description?:string}){
    const docRef = doc(this._dbaccess,'activities/'+newValue.id);
    return updateDoc(docRef,{
      title : newValue.title,
      link : newValue.link,
      iconName : newValue.iconName,
      description : newValue.description,
    });
  }

  deleteActivity(id:string){
    const docRef = doc(this._dbaccess,'activities/'+id);
    deleteDoc(docRef);
  }

}

export interface UserInfos {
  f_name:string,
  l_name:string,
  email?:string,
  status:string,
  phone?:string|undefined|null,
  birthday?:string|undefined|null,
  s_permit_id?:string|undefined|null,
  address?:string|undefined|null,
  ban?:{author:string,comment:string,date:string}|undefined|null,
  missedCourses?:{courseId:string}|undefined|null,
  id?:string,
  children?:string[],
  parent?:string,
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

