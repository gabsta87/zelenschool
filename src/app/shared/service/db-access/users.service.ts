import { Injectable } from '@angular/core';

import { Auth, User } from '@angular/fire/auth';
import { DocumentData, Firestore, addDoc, arrayRemove, arrayUnion, collection, deleteField, doc, getDocs, setDoc, where } from '@angular/fire/firestore';
import { deleteDoc, getDoc, updateDoc } from '@firebase/firestore';
import dayjs from 'dayjs';
import { deleteUser, getAuth } from 'firebase/auth';
import { Observable, firstValueFrom, map } from 'rxjs';
import { MainAccessService } from './main-access.service';
import { formatForDB, getNowDate } from '../hour-management.service';
import { CalendarEntryService } from './calendar-entry.service';


@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(
    private readonly _dbaccess:Firestore,
    private readonly _auth:Auth,
    private readonly _mainAccess : MainAccessService,
    private readonly _calendarEntries : CalendarEntryService
  ) { }
   // Users Management

   getUsers(){
    return this._mainAccess.getElements("users");
  }

  async getUser(userId:string):Promise<DocumentData|undefined>{
    // const docRef = doc(this._dbaccess, "users", userId);
    // const docSnap = await getDoc(docRef);
    // console.log("user found : ",docSnap.data());
    
    // return docSnap.data() ? {...docSnap.data(),id:userId} : undefined;

    return this._mainAccess.getSnapshot("users",userId);
    
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
    let futureCourses = await firstValueFrom(this._calendarEntries.getCalendarEntries().pipe(map( (courses:any) => courses = courses.filter((course:any) =>dayjs(course.timeStart).isAfter(dayjs(getNowDate()),"hour") ))) )
    
    futureCourses.forEach( (course:any)=> this.removeUserFromCourse(course['id'],userId))
  }

  async removeUser(userId:string){
    let value = await this._mainAccess.getSnapshot("users",userId);
    
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

  // Updates current user infos
  updateCurrentUser(newValue:any){
    const docRef = doc(this._dbaccess,'users/'+this._auth.currentUser?.uid);
    // console.log("updating user ",this._auth.currentUser?.uid," with value ",newValue);
    
    return updateDoc(docRef,{...newValue});
  }

  async getCurrentUserLanguage():Promise<string|undefined>{
    let currentUserId = this._auth.currentUser?.uid;
    if(currentUserId){
      let userData = await this._mainAccess.getSnapshot("users",currentUserId);
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
    const courses = this._mainAccess.getElements("calendarEntries",where("author","==",teacherId));

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
    return firstValueFrom(this._mainAccess.getElements("articles"));
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
