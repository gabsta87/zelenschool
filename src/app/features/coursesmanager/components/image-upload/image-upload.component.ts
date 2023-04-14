import { Component } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { StorageService } from 'src/app/shared/service/storage.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  selectedFile: File = null as any;
  downloadURL!: Observable<string>;
  uploading = false;

  private readonly _apiUrl = 'http://localhost:3000/assets/';

  constructor(private storage: StorageService, private _db: AngularfireService,private readonly _http: HttpClient,private readonly _router:Router) { }

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

  saveImageOnServer() {
    const formData = new FormData();
    formData.append('file', this.imageFile, this.imageFile.name);

    console.log("saving on server");
    console.log("data : ",formData);
    
    
    const data = {
      name: this.imageName,
      function: this.imageFunction
    };

  //  formData.append('data', JSON.stringify(data));

    this.uploading = true;
    const result = this._http.post(this._apiUrl, formData);
    console.log("result : ",firstValueFrom(result));
    this.uploading = false;
    return result;
  }

  async saveImage() {
    const filePath = `${this.imageFile.name}`;
    
    this.uploading = true;
    const downloadUrl = "";
    // const downloadUrl = await this.storage.storeImage(this.imageFile,this.imageName,this.imageFunction);
    console.log("removed url ");
    
    
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

  returnToAdminPage(){
    this._router.navigate(['/admin/'])
  }
}
