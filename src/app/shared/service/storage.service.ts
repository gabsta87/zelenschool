import { Injectable } from '@angular/core';
import { getApp } from "firebase/app";
import { DocumentData, deleteDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { firstValueFrom } from 'rxjs';
import { AngularfireService } from './angularfire.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  firebaseApp = getApp();
  storage = getStorage(this.firebaseApp, "gs://zelenschool-6981a.appspot.com");
  imagesRef = ref(this.storage,"images");

  constructor(private readonly _db: AngularfireService){ }

  private async storeImage(file: File, collection:string): Promise<string> {
    if(file == undefined || collection == "")
      return "";

    // Creating image reference
    const imageRef = ref(this.imagesRef, collection+"/"+file.name);

    const uploadTask = uploadBytesResumable(imageRef, file);
    // uploadTask.snapshotChanges().pipe(
    //   finalize(async () => {
    //     const downloadUrl = await getDownloadURL(imageRef);
    //   })
    // ).subscribe();

    // Upload image
    await uploadBytes(imageRef, file);

    // get image URL
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  }

  async addEventImage(newFile:File){
    return this.addImage("assoEvents",newFile)
  }

  async addProjectImage(newFile:File){
    return this.addImage("projects",newFile)
  }

  async addMemberImage(newFile:File){
    return this.addImage("assoMembers",newFile);
  }
  
  async addPartnerImage(newFile:File){
    return this.addImage("partners",newFile);
  }

  private async addImage(collection:string,newFile:File){
    const link = await this.storeImage(newFile,collection);
    this._db.addImage({collection : collection, link : link, name: newFile.name});
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

  renameGallery(id:string,newName:string){
    this._db.updateGallery(id,newName);
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

  deleteImageFromURL(url:string){
    const fileRef = ref(this.storage,url);
    deleteObject(fileRef);
  }

}
