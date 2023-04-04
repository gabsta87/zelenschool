import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { DocumentData } from 'firebase/firestore';
import { BehaviorSubject, firstValueFrom, map, Observable } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { formatForDB, formatTime, getNowDate } from 'src/app/shared/service/hour-management.service';

@Component({
  selector: 'app-teacher-create-event-modal',
  templateUrl: './teacher-create-event-modal.component.html',
  styleUrls: ['./teacher-create-event-modal.component.scss']
})
export class TeacherCreateEventModalComponent {
  selectedDays!:any[];

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

  ionViewDidEnter(){
    this.updateTime();
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm(){
    
    let entry;

    this.selectedDays.forEach(e => {
      
      let entryTimeStart = dayjs(e.date).hour(dayjs(this.timeStart).hour()).minute(dayjs(this.timeStart).minute()).toString();
      let entryTimeEnd = dayjs(e.date).hour(dayjs(this.timeEnd).hour()).minute(dayjs(this.timeEnd).minute()).toString();

      entry = {
        title:this.title,
        timeStart:entryTimeStart,
        timeEnd:entryTimeEnd,
        room_id:this.room_id,
        max_participants:this.max_participants,
        description:this.description
      }
      this._db.createCalendarEntry(entry);
    })
    
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  multiCollisions!:any;

  async updateTime(){
    
    if(this.selectedDays.length > 1){
      this.multiCollisions = this.selectedDays.map( (e:any) => {
        let entryTimeStart = dayjs(e.date).hour(dayjs(this.timeStart).hour()).minute(dayjs(this.timeStart).minute());
        let entryTimeEnd = dayjs(e.date).hour(dayjs(this.timeEnd).hour()).minute(dayjs(this.timeEnd).minute());

        let resultingCollisions = this._db.getCalendarEntriesCollisions(formatTime(entryTimeStart),formatTime(entryTimeEnd));
        
        resultingCollisions.pipe(map((collision:any) => {
          console.log("collision : ",collision);
          return;
        }))

        return {day : e, collision : resultingCollisions as Observable<DocumentData[]>};
      }) 
    }else{
      // Check possibility to do it with observable 
      this.collisionEvents = await firstValueFrom(this._db.getCalendarEntriesCollisions(this.timeStart,this.timeEnd));

      if(this.collisionEvents){
        this.collisionIndex = this.collisionEvents.findIndex(e => e['room_id'] == this.room_id);
        this.isValid.next(this.collisionIndex == -1)
      }else{
        this.isValid.next(true);
      }
    }
  }

  updateStartingHour($event:any){
    let newValue = $event.detail.value;
    
    this.isValid.next(newValue < 24 && newValue >= 0);

    this.timeStart = dayjs(this.timeStart).hour(newValue).toString();
    this.timeEnd = dayjs(this.timeStart).add(this.duration,this.durationUnit).toString();
    this.updateTime();
  }

  updateStartingMinute($event:any){
    
    let newValue = $event.detail.value;
    
    this.isValid.next(newValue < 60 && newValue >= 0);
    
    this.timeStart = dayjs(this.timeStart).minute(newValue).toString();
    this.timeEnd = dayjs(this.timeStart).add(this.duration,this.durationUnit).toString();
    this.updateTime();
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

  removeDay(index:number){
    if(this.selectedDays.length > 1){
      this.selectedDays.splice(index,1);
      this.isValid.next(this.selectedDays.length > 0);
      this.updateTime()
    }
    // TODO remove from calendar
  }
}
