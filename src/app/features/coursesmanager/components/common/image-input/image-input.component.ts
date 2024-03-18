import { Component } from '@angular/core';

@Component({
  selector: 'app-image-input',
  templateUrl: './image-input.component.html',
  styleUrls: ['./image-input.component.scss']
})
export class ImageInputComponent {
  imageSource!:string;
  imageFile!:File;

  loadImage($event:any){
    this.imageFile =  $event.target.files[0];
  }
}
