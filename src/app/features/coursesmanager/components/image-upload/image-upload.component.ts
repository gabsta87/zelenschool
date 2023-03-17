import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { StorageService } from 'src/app/shared/service/storage.service';


@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  selectedFile: File = null as any;
  downloadURL!: Observable<string>;
  uploading = false;

  constructor(private storage: StorageService, private _db: AngularfireService) { }

  // onUpload() {
  //   const file = this.selectedFile;
  //   const filePath = `images/${file.name}`;

  //   const fileRef = this.storage.ref(filePath);
  //   const task = this.storage.upload(filePath, file);

  //   task.snapshotChanges().pipe(
  //     finalize(() => {
  //       this.downloadURL = fileRef.getDownloadURL();
  //       this.downloadURL.subscribe(url => {
  //         this._db.createImageEntry({
  //           name: file.name,
  //           function: '',
  //           url: url
  //         })
  //       });
  //     })
  //   ).subscribe();
  // }

  imageFile!: File;
  croppedImage: any = '';
  imageName: string = '';
  imageFunction: string = '';

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    this.imageFile = file;
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64;
  }

  // saveImage(): void {
  //   const filePath = `${this.imageFile.name}`;
  //   const fileRef = this.storage.ref(filePath);
  //   const uploadTask = this.storage.upload(filePath, this.imageFile);

  //   uploadTask.snapshotChanges().pipe(
  //     finalize(() => {
  //       fileRef.getDownloadURL().subscribe((downloadUrl:any) => {
  //         const data = {
  //           name: this.imageName,
  //           function: this.imageFunction,
  //           imageUrl: downloadUrl
  //         };

  //         this._db.createImageEntry(data);
  //       });
  //     })
  //   ).subscribe();
  // }

  async saveImage() {
    const filePath = `${this.imageFile.name}`;
    
    this.uploading = true;
    const downloadUrl = await this.storage.storeImage(this.imageFile,this.imageName,this.imageFunction);
    
    const data = {
      name: this.imageName,
      function: this.imageFunction,
      imageUrl: downloadUrl
    };

    await this._db.createImageEntry(data);

    this.uploading = false;
  }

  resetForm(): void {
    this.imageFile = null as any;
    this.croppedImage = '';
    this.imageName = '';
    this.imageFunction = '';
  }
}
