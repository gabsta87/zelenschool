import { Injectable } from '@angular/core';
import { getApp } from "firebase/app";
import { getStorage, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { getDownloadURL } from 'firebase/storage'; // Ajout de l'importation
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  firebaseApp = getApp();
  storage = getStorage(this.firebaseApp, "gs://zelenschool-6981a.appspot.com");
  imagesRef = ref(this.storage,"images");

  async storeImage(file: File, imageName: string, comment:string): Promise<string> {
    // Créez une référence pour l'image
    const imageRef = ref(this.imagesRef, imageName);

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


}
