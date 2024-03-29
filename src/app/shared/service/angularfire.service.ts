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

@Injectable({
  providedIn:'root'
})
export class AngularfireService{
  
  constructor(
    private readonly _dbaccess:Firestore,
    private readonly _auth:Auth,
  ) { }

  getElements(name:string,...constraint:QueryConstraint[]){
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
    // TODO Remove user from AUTH

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

  // Asso members management

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

  // Partners management

  getPartners(){
    return this.getElements("partners");
  }

  writePartner(newEntry : {logoName:string,link:string,name:string}){
    return addDoc(collection(this._dbaccess,"partners"),{ ...newEntry })
  }

  deletePartner(entry:DocumentData){
    const docRef = doc(this._dbaccess,'partners/'+entry['id']);
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
  // TODO Copy in different file

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
      title : newValue?.title,
      link : newValue?.link,
      iconName : newValue?.iconName,
      description : newValue?.description,
    });
  }

  deleteActivity(id:string){
    const docRef = doc(this._dbaccess,'activities/'+id);
    deleteDoc(docRef);
  }

  // Asso Events management

  async getAssoEvents():Promise<Observable<DocumentData[]>>{
    const evts = await this.getElements("assoEvent");
    return evts;
  }

  async getAssoEvent(id:string){
    return this.getSnapshot("assoEvents",id);
  }

  createAssoEvent(newValue:{name:string,galleryId?:string,leafletLink?:string,location?:string,participants?:string[],timeStart?:string,timeEnd?:string}){
    return addDoc(collection(this._dbaccess,"assoEvent"),{ ...newValue })
  }

  updateAssoEvent(newValue : {id:string,name?:string,galleryId?:string,leafletLink?:string,location?:string,participants?:string[],timeStart?:string,timeEnd?:string}){
    const docRef = doc(this._dbaccess,'assoEvent/'+newValue.id);
    
    return updateDoc(docRef,{
      name:newValue.name?newValue.name:"",
      galleryId:newValue.galleryId?newValue.galleryId:"",
      leafletLink:newValue.leafletLink?newValue.leafletLink:"",
      location:newValue.location?newValue.location:"",
      participants:newValue.participants?newValue.participants:"",
      timeStart:newValue.timeStart?newValue.timeStart:"",
      timeEnd:newValue.timeEnd?newValue.timeEnd:""});
  }

  deleteAssoEvent(id:string){
    const docRef = doc(this._dbaccess,'assoEvent/'+id);
    deleteDoc(docRef);
  }

  // Asso centers management

  async getAssoCenters():Promise<Observable<DocumentData[]>>{
    const centers = await this.getElements("assoCenter");
    return centers;
  }

  getAssoCenter(id:string){
    const center = this.getSnapshot("assoCenter",id);
    return center;
  }

  getAssoCenterObs(id:string){
    const center = this.getElements("assoCenter",where("id","==",id));
    return center;
  }

  updateAssoCenter(newValue:{id:string,name?:string,location?:string,centerPhotoLink?:string,contactPerson?:string,contactPhone?:string,contactPhotoLink?:string,rooms?:string[],openingHours?:string[]}){
    if(!newValue.id || newValue.id == ""){

      return addDoc(collection(this._dbaccess,"assoCenter"),{
        name : newValue.name ? newValue.name : "",
        location : newValue.location ? newValue.location : "",
        centerPhotoLink : newValue.centerPhotoLink ? newValue.centerPhotoLink : "",
        contactPerson : newValue.contactPerson ? newValue.contactPerson : "",
        contactPhone : newValue.contactPhone ? newValue.contactPhone : "",
        contactPhotoLink : newValue.contactPhotoLink ? newValue.contactPhotoLink : "",
        rooms: newValue.rooms ? newValue.rooms : "",
        openingHours: newValue.openingHours ? newValue.openingHours : "",
      })
    }else{
      // Removing the ID property from the new value
      // const { id,imageFile, ...strippedValue } = newValue;

      const docRef = doc(this._dbaccess,'assoCenter/'+newValue.id);
      // return updateDoc(docRef,strippedValue);
      return updateDoc(docRef,{
        name : newValue.name ? newValue.name : "",
        location : newValue.location ? newValue.location : "",
        centerPhotoLink : newValue.centerPhotoLink ? newValue.centerPhotoLink : "",
        contactPerson : newValue.contactPerson ? newValue.contactPerson : "",
        contactPhone : newValue.contactPhone ? newValue.contactPhone : "",
        contactPhotoLink : newValue.contactPhotoLink ? newValue.contactPhotoLink : "",
        rooms: newValue.rooms ? newValue.rooms : "",
        openingHours: newValue.openingHours ? newValue.openingHours : "",
      });
    }
  }
  
  async deleteAssoCenter(id:string){
    const center = await this.getAssoCenter(id);

    // Deleting rooms of the center
    if(center){
      const rooms = center['rooms'];
      rooms.forEach((roomID:string) => {
        const docRef = doc(this._dbaccess,'rooms/'+roomID);
        deleteDoc(docRef);
      })
    }

    const docRef = doc(this._dbaccess,'assoCenter/'+id);
    deleteDoc(docRef);
  }

  async deleteDayScedule(assoCenterID:string,index:number){
    const center = await this.getAssoCenter(assoCenterID);

    if(center){
      const schedules = center['openingHours'];
      schedules.splice(index,1);
      
      return this.updateAssoCenter({id:assoCenterID,openingHours:schedules})
    }
  }

  // Rooms management
  getRooms(){
    return this.getElements("rooms");
  }

  getRoom(id:string){
    const room = this.getSnapshot("rooms",id);
    return room;
  }

  async updateRoom(room : {id: string, name: string, maxStudents: number, assoCenterID:string}){
    
    if(!room.id || room.id == ""){
      // Creating a new room
      const result = await addDoc(collection(this._dbaccess,"rooms"),{ name: room.name, maxStudents: room.maxStudents, assoCenter : room.assoCenterID})
      
      // Adding the room reference in the Association Center
      const center = await this.getAssoCenter(room.assoCenterID);
      let newArray;
      if(center && center['rooms']){
        newArray = [...center['rooms'],result.id]
      }else{
        newArray = [result.id];
      }
      this.updateAssoCenter({id:room.assoCenterID,rooms:newArray})

      return result;
    }else{
      // Adding a new room
      const docRef = doc(this._dbaccess,'rooms/'+room.id);
      
      return updateDoc(docRef,{name : room.name, maxStudents : room.maxStudents, assoCenter : room.assoCenterID});
    }
  }

  async deleteRoom(id:string){
    const room = await this.getRoom(id);
    
    // Removing room from assoCenter
    if(room){
      const center = await this.getAssoCenter(room['assoCenter']);
      
      if(center){
        const rooms = center['rooms']; 
        const newRooms = rooms.filter((roomId:string) => roomId != id)
        
        this.updateAssoCenter({id:center['id'],rooms:newRooms})
      }
    }
    
    const docRef = doc(this._dbaccess,'rooms/'+id);
    deleteDoc(docRef);
  }

  // Asso projects management
  getAssoProject(id:string){
    return this.getSnapshot("assoProjects",id);
  }

  getAssoProjects(){
    return this.getElements("assoProjects");
  }

  createAssoProject(newValue : any){
    console.log("new value : ",newValue);
    
    return addDoc(collection(this._dbaccess,"assoProjects"),{ 
      author:newValue.author?newValue.author:"",
      date:newValue.date?newValue.date:"",
      description:newValue.description?newValue.description:"",
      imgLink:newValue.imgLink?newValue.imgLink:"",
      name:newValue.name?newValue.name:"",
      type:newValue.type?newValue.type:""
     })
  }

  deleteAssoProject(id:string){
    const docRef = doc(this._dbaccess,'assoProjects/'+id);
    deleteDoc(docRef);
  }

  updateAssoProject(newValue:{id:string,author?:string,date?:string,description?:string,imgLink?:string,name?:string,type?:string}){

    console.log("new value : ",newValue);
    
    const docRef = doc(this._dbaccess,'assoProjects/'+newValue.id);
    
    return updateDoc(docRef,{
      author:newValue.author?newValue.author:"",
      date:newValue.date?newValue.date:"",
      description:newValue.description?newValue.description:"",
      imgLink:newValue.imgLink?newValue.imgLink:"",
      name:newValue.name?newValue.name:"",
      type:newValue.type?newValue.type:""
    });
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

