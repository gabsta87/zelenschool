import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DocumentData } from 'firebase/firestore';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

@Component({
  selector: 'app-new-room-modal',
  templateUrl: './new-room-modal.component.html',
  styleUrls: ['./new-room-modal.component.scss']
})
export class NewRoomModalComponent {

  id!:string;
  name!:string;
  maxStudents!:string;
  assoCenterData!:DocumentData;

  constructor( private readonly modalCtrl : ModalController){}

  confirm(){
    let entry = {
      id:this.id?this.id:"",
      name:this.name,
      maxStudents:this.maxStudents?this.maxStudents:"",
      assoCenterID:this.assoCenterData['id'],
    }
    
    return this.modalCtrl.dismiss(entry, 'confirm');
  }

  cancel(){
    return this.modalCtrl.dismiss(undefined, 'cancel');
  }

}
