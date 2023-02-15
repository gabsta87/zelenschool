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
  title:string = "";
  max_participants = 0;
  room_id!:string;
  meta!:any;
  fullName!:string;

  dataObs!:Observable<DocumentData|undefined>;
  creator!:UserInfos|undefined;

  constructor(private readonly modalCtrl:ModalController,private readonly _db: AngularfireService){ }

  async ionViewWillEnter(){

    this.dataObs = this._db.getCalendarEntry(this.meta.id);

    let actualValue = await firstValueFrom(this.dataObs);

    if(actualValue){
      this.creator = await this._db.getUser(actualValue['author']);
      this.fullName = this.creator?.f_name+" "+this.creator?.l_name
    }
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
