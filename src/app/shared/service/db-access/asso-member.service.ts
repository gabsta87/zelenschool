import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';

import { find } from 'rxjs';
import { MainAccessService } from './main-access.service';


@Injectable({
  providedIn: 'root'
})
export class AssoMemberService {

  constructor(
    private readonly _dbaccess:Firestore,
    private readonly _mainAccess : MainAccessService
    ) { }
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
    return this._mainAccess.getElements("assoMembers");
  }

  getAssoMember(id:string){
    return this.getAssoMembers().pipe(find((e:any) => e.id === id));
  }

}

export interface AssoMember{
  id?:string,
  role:string,
  name:string,
  link?:string,
  photo?:string
}
