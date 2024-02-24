import { Injectable } from '@angular/core';
import { collectionData } from '@angular/fire/firestore';
import { DocumentData, Firestore, QueryConstraint, collection, doc, getDoc, query } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class MainAccessService {
  constructor(
    private readonly _dbaccess:Firestore,
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
}
