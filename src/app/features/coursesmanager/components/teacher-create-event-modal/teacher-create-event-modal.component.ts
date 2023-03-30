import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { DocumentData } from 'firebase/firestore';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { formatTime, getNowDate, HourManagementService } from 'src/app/shared/service/hour-management.service';

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

  now = getNowDate();

  isValid = new BehaviorSubject<Boolean>(false);
  collisionEvents!:DocumentData[]|undefined;

  collisionIndex !: number;

  constructor(private readonly modalCtrl:ModalController,private readonly _db: AngularfireService){ }

  ionViewWillEnter(){
    
    console.log("time start : ",this.timeStart);
    console.log("time start formatted : ",formatTime(this.timeStart));
    console.log("time start local : ",dayjs(this.timeStart).local().format());
    console.log("time start utc iso: ",dayjs(this.timeStart).utc().toISOString());
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  confirm(){
    
    let entry = {title:this.title,timeStart:this.timeStart,timeEnd:this.timeEnd,room_id:this.room_id,max_participants:this.max_participants,description:this.description}

    this._db.createCalendarEntry(entry);
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  async updateTime(){
    
    // Check possibility to do it with observable 
    this.collisionEvents = await firstValueFrom(this._db.getCalendarEntriesCollisions(this.timeStart,this.timeEnd));

    if(this.collisionEvents){
      this.collisionIndex = this.collisionEvents.findIndex(e => e['room_id'] == this.room_id);
      this.isValid.next(this.collisionIndex == -1)
    }else{
      this.isValid.next(true);
    }
  }

  updateTimeStartFromEvent($event:any){
    this.timeStart = $event.detail.value;
    this.timeEnd = formatTime(dayjs(this.timeStart).add(this.duration,this.durationUnit));

    return this.updateTime();
  }
  
  updateDuration($event:any){
    this.duration = $event.detail.value;
    this.timeEnd = formatTime(dayjs(this.timeStart).add($event.detail.value,this.durationUnit));

    return this.updateTime();
  }

  updateDurationUnit($event:any){
    this.durationUnit = $event.detail.value;
    this.timeEnd = formatTime(dayjs(this.timeStart).add(this.duration,$event.detail.value));
    
    return this.updateTime();
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
