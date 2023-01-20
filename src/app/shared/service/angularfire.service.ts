import { Injectable } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { collection, QueryConstraint, Firestore, where, addDoc, collectionData, orderBy, setDoc, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from '@angular/fire/firestore';
import { query, GeoPoint } from '@firebase/firestore';
import { firstValueFrom, map, min } from 'rxjs';

@Injectable({
  providedIn:'root'
})
export class AngularfireService{
  constructor(
    private readonly _dbaccess:Firestore,
    private readonly _auth:Auth) { }

  private getElements(name:string,...constraint:QueryConstraint[]){
    const myCollection = collection(this._dbaccess,name);

    let data = query(myCollection,...constraint)

    const observableStream = collectionData(data, {idField: 'id'})
    return observableStream;
  }

  createCalendarEntry(newEntry: Date) {
    let attendantId = "_";
    if(!this._auth.currentUser?.uid){
      attendantId="_"
    }else{
      attendantId = this._auth.currentUser.uid
    }
    // if(!this._auth.currentUser?.uid)
    //   return
    return addDoc(collection(this._dbaccess,"calendarEntries"),{eventDate:newEntry,attendantsId:[attendantId]});
  }

  getCalendarEntries(){
    return this.getElements("calendarEntries");
  }
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
