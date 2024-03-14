import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DocumentData } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

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
  roomsData!:{id:string,name:string,maxStudents:string}[];
  roomsObs!:Observable<DocumentData[]>;
  openingHoursObs!:Observable<DocumentData[]>;

  constructor( 
    private readonly modalCtrl : ModalController, 
    private readonly _db: AngularfireService,
    ){}

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

  deleteRoom(id:string){
    if(id != undefined && id != "")
      this._db.deleteRoom(id);
  }

  deleteDaySchedule(index:number){
    this._db.deleteDayScedule(this.id,index);
  }
}
