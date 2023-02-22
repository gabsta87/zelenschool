import { Injectable } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { collection, QueryConstraint, Firestore, addDoc, collectionData, doc, setDoc, DocumentData, where, arrayUnion, arrayRemove} from '@angular/fire/firestore';
import { deleteDoc, query, updateDoc } from '@firebase/firestore';
import { find, firstValueFrom, map, Observable } from 'rxjs';
import { getDatabase } from "firebase/database";
import * as dayjs from 'dayjs';

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

  createCalendarEntry(newEntry: {title:string,eventDate:string,room_id:string,max_participants:number}){
    if(!this._auth.currentUser?.uid){
      console.log("User not logged, no event created");
      return
    }
    return addDoc(collection(this._dbaccess,"calendarEntries"),{
      eventDate:newEntry.eventDate,
      attendantsId:[],
      title:newEntry.title,
      author:this._auth.currentUser.uid,
      room_id:newEntry.room_id,
      max_participants:newEntry.max_participants
    });
  }
  
  updateCalendarEntry(newEntry: {id:string,title:string,eventDate:string,room_id:string,max_participants:number}) {
    if(!this._auth.currentUser?.uid){
      console.log("User not logged, impossible to edit event");
      return
    }

    return updateDoc(doc(this._dbaccess,"calendarEntries",newEntry.id),{
      eventDate:dayjs(newEntry.eventDate).toISOString(),
      title:newEntry.title,
      author:this._auth.currentUser.uid,
      room_id:newEntry.room_id,
      max_participants:newEntry.max_participants
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
    let temp = this.getCalendarEntries();
    return temp.pipe(map(datas => datas.find(e => e['id'] === idToFind)));
  }

  getFutureCalendarEntries(){
    let temp = this.getCalendarEntries();
    return temp.pipe(map(datas => datas.find(e => dayjs(e['eventDate']).isAfter(dayjs(new Date())))));
  }

  getUsers(){
    return this.getElements("users");
  }

  async getUser(userId:string):Promise<UserInfos|undefined>{
    let temp = await firstValueFrom(this.getUsers());
    return temp.find(e => e['id'] === userId);
  }

  getUserObs(userId:string):Observable<DocumentData | undefined>{
    let tempObs = this.getUsers();
    return tempObs.pipe(map(datas => datas.find(e => e['id'] === userId)));
  }

  setUser(param:UserInfos) {
    const docRef = doc(this._dbaccess,'users/'+this._auth.currentUser?.uid);
    return setDoc(docRef,{f_name:param.f_name,l_name:param.l_name,birthday:param.birthday,email:param.email,phone:param.phone,s_permit_id:param.s_permit_id,address:param.address});
  }

  updateUser(newValue:any){
    const docRef = doc(this._dbaccess,'users/'+this._auth.currentUser?.uid);
    return updateDoc(docRef,newValue);
  }

  getArticles(){
    return firstValueFrom(this.getElements("articles"));
  }

  async createUser(newUser:User){
    let userId = newUser.uid;
    let userStored = await this.getUser(userId);

    if(userStored){
      return
    }

    return doc(this._dbaccess,'users/'+userId);
  }
}

export interface UserInfos {
  f_name?:string|undefined|null,
  l_name?:string|undefined|null,
  birthday?:string|undefined|null,
  email?:string|undefined|null,
  phone?:string|undefined|null,
  s_permit_id?:string|undefined|null,
  address?:string|undefined|null
}

  // addOrder(newValue:number){
  //   const id = Date.now();
  //   const docRef = doc(this._dbaccess,this._dbName+'/'+id);
  //   setDoc(docRef,{orderValue:newValue});
  // }

  // async updateOrder(id:string){
  //   const docRef = doc(this._dbaccess, `${this._dbName}/${id}`);
  //   updateDoc(docRef,{done:true});
  // }

  // async deleteOrder(id:string){
  //   const docRef = doc(this._dbaccess,`${this._dbName}/${id}`);
  //   deleteDoc(docRef);
  // }
