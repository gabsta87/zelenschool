import { Component, Inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DocumentData } from 'firebase/firestore';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
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
  description!:string;
  @Inject('dayjs') private readonly dayjs: any;

  isValid = new BehaviorSubject<Boolean>(true);
  collisionEvents!:DocumentData[]|undefined;
  collisionIndex !: number;

  constructor(private readonly modalCtrl:ModalController,private readonly _db: AngularfireService){ }

  cancel(){
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  confirm(){
    let entry = {title:this.title,eventDate:this.time,room_id:this.room_id,max_participants:this.max_participants,description:this.description}
    
    this._db.createCalendarEntry(entry);
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  async updateTime($event:any){
    this.collisionEvents = await firstValueFrom(this._db.getCalendarEntryByTime(this.dayjs($event.detail.value)));
    if(this.collisionEvents){
      console.log("events found ",this.collisionEvents);
      this.collisionIndex = this.collisionEvents.findIndex(e => e['room_id'] == this.room_id);
      this.isValid.next(this.collisionIndex == -1)
    }else{
      console.log("empty");
      this.isValid.next(true);
    }
    this.time = $event.detail.value;
  }

  updateRoom($event:any){
    // If there are no events at the same time, no validation required
    if(!this.collisionEvents){
      return
    }
    
    this.collisionIndex = this.collisionEvents.findIndex(e => e['room_id'] == $event.detail.value);
    this.isValid.next(this.collisionIndex == -1)
  }
}
