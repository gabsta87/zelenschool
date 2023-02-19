import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DocumentData } from 'firebase/firestore';
import { firstValueFrom, Observable } from 'rxjs';
import { AngularfireService, UserInfos } from 'src/app/shared/service/angularfire.service';

@Component({
  selector: 'app-teacher-create-event-modal',
  templateUrl: './teacher-create-event-modal.component.html',
  styleUrls: ['./teacher-create-event-modal.component.scss']
})
export class TeacherCreateEventModalComponent {
  time!:string;
  title!:string;
  max_participants!:number;
  room_id!:string;
  meta!:any;

  constructor(private readonly modalCtrl:ModalController,private readonly _db: AngularfireService){ }

  async ionViewWillEnter(){
    console.log("time : ",this.time);
    
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  confirm(){
    let entry = {title:this.title,eventDate:this.time,room_id:this.room_id,max_participants:this.max_participants}
    
    this._db.createCalendarEntry(entry);
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  updateTime($event:any){
    this.time = $event.detail.value;
  }
}
