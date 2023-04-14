import { Injectable } from '@angular/core';
import { getApp } from "firebase/app";
import { deleteObject, getStorage, listAll, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { getDownloadURL } from 'firebase/storage'; // Ajout de l'importation
import { finalize, firstValueFrom, map } from 'rxjs';
import { AngularfireService } from './angularfire.service';
import { DocumentData } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  firebaseApp = getApp();
  storage = getStorage(this.firebaseApp, "gs://zelenschool-6981a.appspot.com");
  imagesRef = ref(this.storage,"images");

  constructor(private readonly _db: AngularfireService){ }

  private async storeImage(file: File, collection:string): Promise<string> {
    // Créez une référence pour l'image
    const imageRef = ref(this.imagesRef, collection+"/"+file.name);

    const uploadTask = uploadBytesResumable(imageRef, file);

    // uploadTask.snapshotChanges().pipe(
    //   finalize(async () => {
    //     const downloadUrl = await getDownloadURL(imageRef);
    //   })
    // ).subscribe();

    // Uploadez l'image
    await uploadBytes(imageRef, file);

    // Récupérez l'URL de l'image
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  }

  async addMemberImage(newFile:File){
    const collectionName = "assoMembers";
    const link = await this.storeImage(newFile,collectionName);

    return link;
  }

  getGalleries(){
    return this._db.getGalleries();
  }

  getGalleryImages(galleryId:string){
    const imgsList = this._db.getGalleryImages(galleryId);
    return imgsList;
  }

  createGallery(name:string){
    return this._db.createGallery(name);
  }

  async deleteGallery(id:string){

    const imagesList = await firstValueFrom(this._db.getGalleryImages(id));
    
    imagesList.forEach((image:DocumentData) => {
      const galleryRef = ref(this.imagesRef, id+"/"+image['name']);
      deleteObject(galleryRef).catch(res => console.log(res) )
    })
  
    this._db.deleteGallery(id);
  }

  async addImageToGallery(image:{file:File,collectionId:string,name:string}){
    const link = await this.storeImage(image.file,image.collectionId);
    this._db.addImage({collection : image.collectionId, link : link, name: image.name});
  }

  deleteImageFromGallery(image:{id:string,link:string,collection:string,name:string}){

    if(image.link.includes("http")){
      // Create a reference to the file to delete
      const desertRef = ref(this.imagesRef, image.collection+"/"+image.name);

      // Delete the file
      deleteObject(desertRef).then(() => {
        // File deleted successfully
        this._db.deleteImage(image.id);
      }).catch((error) => {
        // Uh-oh, an error occurred!
        console.log("error : ",error);
      })
    }

    // TODO see if the file must be deleted from firebase anyway or not
    this._db.deleteImage(image.id);

  }

}
