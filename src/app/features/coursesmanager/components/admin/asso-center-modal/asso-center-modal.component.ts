import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DocumentData } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

@Component({
  selector: 'app-asso-center-modal',
  templateUrl: './asso-center-modal.component.html',
  styleUrls: ['./asso-center-modal.component.scss']
})
export class AssoCenterModalComponent {
  id!:string;
  name!:string;
  location!:string;
  contactPerson!:string;
  contactPhone!:string;
  contactMail!:string;
  contactPhotoLink!:string;
  centerPhotoLink!:string;
  openingHours!:string[];
  rooms!:string[];
  roomsData!:{id:string,name:string,maxStudents:string}[];
  roomsObs!:Observable<DocumentData[]>;
  openingHoursObs!:Observable<DocumentData[]>;

  imageFile!:File;
  oldImageAddress!:string;

  constructor( 
    private readonly modalCtrl : ModalController,
    private readonly _db: AngularfireService,
    ){}

  confirm(){
    let entry = {
      id:this.id?this.id:"",
      name : this.name ? this.name : "",
      location : this.location ? this.location : "",
      contactPerson : this.contactPerson ? this.contactPerson : "",
      centerPhotoLink : this.centerPhotoLink ? this.centerPhotoLink : "",
      contactPhone:this.contactPhone?this.contactPhone:"",
      contactMail : this.contactMail ? this.contactMail : "",
      contactPhotoLink:this.contactPhotoLink?this.contactPhotoLink:"",
      openingHours:this.openingHours?this.openingHours:[],
      rooms:this.rooms?this.rooms:[],
      imageFile : this.imageFile,
      oldImageAddress : this.oldImageAddress,
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

  async addImage(event: any) {
    this.imageFile = event.target.files[0];
    const tempImageURL = URL.createObjectURL(this.imageFile);
    
    if(this.centerPhotoLink != undefined)
      this.oldImageAddress = this.centerPhotoLink;

    this.centerPhotoLink = tempImageURL;
  }
}
