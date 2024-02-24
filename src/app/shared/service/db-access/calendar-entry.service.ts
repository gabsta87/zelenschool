import { Injectable } from '@angular/core';
import { DocumentData, Firestore, addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { CalendarEntry } from '../angularfire.service';
import { formatForDB, isColliding } from '../hour-management.service';
import { Auth } from '@angular/fire/auth';
import { Observable, map, switchMap } from 'rxjs';
import { MainAccessService } from './main-access.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarEntryService {

  constructor(
    private readonly _dbaccess:Firestore,
    private readonly _auth:Auth,
    private readonly _mainAccess : MainAccessService
    ) { }
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
    return this._mainAccess.getElements("calendarEntries");
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

  getRoom(id:string){
    const room = this._mainAccess.getSnapshot("rooms",id);
    return room;
  }
}
