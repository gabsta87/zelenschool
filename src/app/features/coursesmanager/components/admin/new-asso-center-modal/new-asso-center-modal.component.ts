import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-new-asso-center-modal',
  templateUrl: './new-asso-center-modal.component.html',
  styleUrls: ['./new-asso-center-modal.component.scss']
})
export class NewAssoCenterModalComponent {
  id!:string;
  name!:string;
  location!:string;
  contactPerson!:string;
  contactPhone!:string;
  contactPhotoLink!:string;
  openingHours!:string[];
  rooms!:string[];

  constructor( private readonly modalCtrl : ModalController, ){}

  confirm(){
    let entry = {
      id:this.id?this.id:"",
      name:this.name,
      location:this.location?this.location:"",
      contactPerson:this.contactPerson?this.contactPerson:"",
      contactPhone:this.contactPhone?this.contactPhone:"",
      contactPhotoLink:this.contactPhotoLink?this.contactPhotoLink:"",
      openingHours:this.openingHours?this.openingHours:[],
      rooms:this.rooms?this.rooms:[],
    }
    
    return this.modalCtrl.dismiss(entry, 'confirm');
  }

  cancel(){
    return this.modalCtrl.dismiss(undefined, 'cancel');
  }
}
