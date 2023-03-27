import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { DocumentData } from 'firebase/firestore';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

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

  isValid = new BehaviorSubject<Boolean>(false);
  collisionEvents!:DocumentData[]|undefined;

  collisionIndex !: number;

  constructor(private readonly modalCtrl:ModalController,private readonly _db: AngularfireService){ }

  async ionViewDidEnter(){
    console.log("this time : ",dayjs(this.time).format("DD:MM:YY HH:mm Z"));
    
    this.updateTime(this.time);
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  confirm(){
    let entry = {title:this.title,eventDate:this.time,room_id:this.room_id,max_participants:this.max_participants,description:this.description}

    this._db.createCalendarEntry(entry);
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  async updateTime(newTime:any){
    console.log("dayjs event : ",dayjs(newTime).format("DD:MM:YY HH:mm Z"));
    
    this.collisionEvents = await firstValueFrom(this._db.getCalendarEntryByTime(dayjs(newTime)));

    if(this.collisionEvents){
      this.collisionIndex = this.collisionEvents.findIndex(e => e['room_id'] == this.room_id);
      this.isValid.next(this.collisionIndex == -1)
    }else{
      this.isValid.next(true);
    }
    this.time = newTime;
  }

  updateTimeFromEvent($event:any){
    return this.updateTime($event.detail.value);
  }

  updateRoom($event:any){
    // If there are no events at the same time, no validation required
    if(!this.collisionEvents){
      this.isValid.next(this.room_id != undefined)
      return
    }
    
    this.collisionIndex = this.collisionEvents.findIndex(e => e['room_id'] == $event.detail.value);
    this.isValid.next(this.collisionIndex == -1)
  }
}
