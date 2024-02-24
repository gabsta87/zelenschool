import { Injectable } from '@angular/core';

import { Auth } from '@angular/fire/auth';
import { Firestore, addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { getNowDate } from '../hour-management.service';
import { MainAccessService } from './main-access.service';
  
@Injectable({
  providedIn: 'root'
})
export class GalleriesService {

  constructor(
    private readonly _dbaccess:Firestore,
    private readonly _auth:Auth,
    private readonly _mainAccess : MainAccessService,
  ) { }

  // Galleries Management

  getGalleries(){
    return this._mainAccess.getElements("galleries");
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
    const result = this._mainAccess.getElements("images",where("collection","==",id));
    return result;
  }
}
