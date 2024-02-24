import { Injectable } from '@angular/core';
import { DocumentData, Firestore, addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { firstValueFrom } from 'rxjs';
import { MainAccessService } from './main-access.service';

@Injectable({
  providedIn: 'root'
})
export class AssoEventService {

  constructor(
    private readonly _dbaccess:Firestore,
    private readonly _mainAccess : MainAccessService,
  ) { }


  // Asso Events management

  async getAssoEvents():Promise<DocumentData[]>{
    const evts = await firstValueFrom(this._mainAccess.getElements("assoEvent"));
    return evts;
  }

  createAssoEvent(newValue:{name:string,galleryId?:string,leafletLink?:string,location?:string,participants?:string[],timeStart?:string,timeEnd?:string}){
    return addDoc(collection(this._dbaccess,"assoEvent"),{ ...newValue })
  }

  updateAssoEvent(newValue : {id:string,name?:string,galleryId?:string,leafletLink?:string,location?:string,participants?:string[],timeStart?:string,timeEnd?:string}){
    const docRef = doc(this._dbaccess,'activities/'+newValue.id);
    return updateDoc(docRef,{
      name:newValue?.name,
      galleryId:newValue?.galleryId,
      leafletLink:newValue?.leafletLink,
      location:newValue?.location,
      participants:newValue?.participants,
      timeStart:newValue?.timeStart,
      timeEnd:newValue?.timeEnd});
  }

  deleteAssoEvent(id:string){
    const docRef = doc(this._dbaccess,'assoEvent/'+id);
    deleteDoc(docRef);
  }
}
