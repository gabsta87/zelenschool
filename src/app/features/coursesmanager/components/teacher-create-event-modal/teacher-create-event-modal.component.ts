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
  timeStart!:string;
  timeEnd!:string;
  title!:string;
  max_participants!:number;
  room_id!:string;
  description!:string;
  duration = 1;
  durationUnit = 'hour' as dayjs.ManipulateType;

  now = dayjs(new Date()).toISOString();

  isValid = new BehaviorSubject<Boolean>(false);
  collisionEvents!:DocumentData[]|undefined;

  collisionIndex !: number;

  constructor(private readonly modalCtrl:ModalController,private readonly _db: AngularfireService){ }

  async ionViewDidEnter(){
    console.log("this time : ",dayjs(this.timeStart).format("DD:MM:YY HH:mm Z"));
    
    this.updateTime(this.timeStart,true);
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  confirm(){
    let entry = {title:this.title,timeStart:this.timeStart,timeEnd:this.timeEnd,room_id:this.room_id,max_participants:this.max_participants,description:this.description}

    this._db.createCalendarEntry(entry);
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  async updateTime(newTime:string,isStart:boolean){
    console.log("new Time : ",dayjs(newTime).format("HH:mm Z"));
    
    console.log("start time : ",dayjs(this.timeStart).format("HH:mm Z"));
    console.log("end time : ",dayjs(this.timeEnd).format("HH:mm Z"));



    
    // this.collisionEvents = await firstValueFrom(this._db.getCalendarEntryByTime(dayjs(newTime)));
    this.collisionEvents = await firstValueFrom(this._db.getCalendarEntriesCollisions(this.timeStart,this.timeEnd));

    if(this.collisionEvents){
      this.collisionIndex = this.collisionEvents.findIndex(e => e['room_id'] == this.room_id);
      this.isValid.next(this.collisionIndex == -1)
    }else{
      this.isValid.next(true);
    }
   
    // if(isStart){
    //   this.timeStart = newTime;
    // }else{
    //   this.timeEnd = newTime;
    // }
  }




  updateTimeStartFromEvent($event:any){
    this.timeStart = $event.detail.value;
    this.timeEnd = (dayjs(this.timeStart).add(this.duration,this.durationUnit)).toISOString();

    return this.updateTime($event.detail.value,true);
  }
  
  updateDuration($event:any){
    this.duration = $event.detail.value;
    this.timeEnd = (dayjs(this.timeStart).add($event.detail.value,this.durationUnit)).toISOString();

    return this.updateTime($event.detail.value,false);
  }

  updateDurationUnit($event:any){
    this.durationUnit = $event.detail.value;
    this.timeEnd = (dayjs(this.timeStart).add(this.duration,$event.detail.value)).toISOString();
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
