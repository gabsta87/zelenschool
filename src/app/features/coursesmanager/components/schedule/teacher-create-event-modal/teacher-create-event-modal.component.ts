import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { DocumentData } from 'firebase/firestore';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { formatTime, getNowDate } from 'src/app/shared/service/hour-management.service';

@Component({
  selector: 'app-teacher-create-event-modal',
  templateUrl: './teacher-create-event-modal.component.html',
  styleUrls: ['./teacher-create-event-modal.component.scss']
})
export class TeacherCreateEventModalComponent {
  dayRemoveEvent!:any;
  
  selectedDays!:any[];

  timeStart!:string;
  timeEnd!:string;
  title!:string;
  max_participants!:number;
  room_id!:string;
  description!:string;
  duration = 1;
  durationUnit = 'hour' as dayjs.ManipulateType;
  rooms :Observable<DocumentData[]> = this._db.getRooms();

  now = getNowDate();

  isValid = new BehaviorSubject<Boolean>(false);
  isLoading = new BehaviorSubject<Boolean>(false);

  collisionIndexes = [] as number[];
  defaultHour!:number;
  defaultMinute!:number;

  constructor(private readonly modalCtrl:ModalController,private readonly _db: AngularfireService){ }

  ionViewDidEnter(){
    this.defaultHour = dayjs(this.timeStart).hour();
    this.defaultMinute = dayjs(this.timeStart).minute();
    this.updateCollisions();
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

  multiCollisions = [] as any[];
  // multiCollisions = [] as {date:string,collisions:DocumentData}[];

  async updateCollisions(){
    this.isLoading.next(true);
    this.multiCollisions = await Promise.all( this.selectedDays.map(async (day:any) => {
      const entryTimeStart = dayjs(day.date).hour(dayjs(this.timeStart).hour()).minute(dayjs(this.timeStart).minute());
      const entryTimeEnd = dayjs(day.date).hour(dayjs(this.timeEnd).hour()).minute(dayjs(this.timeEnd).minute());
      
      const resultingCollision = await firstValueFrom(this._db.getCalendarEntriesCollisions(formatTime(entryTimeStart),formatTime(entryTimeEnd)));

      return {date : day.date, collisions : resultingCollision}
    }))

    this.isValid.next(this.isRoomAvailable());
    this.isLoading.next(false);
    return this.multiCollisions;
  }

  updateStartingHour($event:any){
    let newValue = $event.detail.value;

    this.timeStart = dayjs(this.timeStart).hour(newValue).toString();
    this.timeEnd = dayjs(this.timeStart).add(this.duration,this.durationUnit).toString();

    this.isValid.next(dayjs(this.timeStart).isAfter(this.now) && this.isRoomAvailable(this.room_id));

    this.updateCollisions();
  }

  updateStartingMinute($event:any){
    let newValue = $event.detail.value;
    
    this.timeStart = dayjs(this.timeStart).minute(newValue).toString();
    this.timeEnd = dayjs(this.timeStart).add(this.duration,this.durationUnit).toString();

    this.isValid.next(dayjs(this.timeStart).isAfter(this.now) && this.isRoomAvailable(this.room_id));
    
    this.updateCollisions();
  }
  
  updateDuration($event:any){
    this.duration = $event.detail.value;
    this.timeEnd = dayjs(this.timeStart).local().add($event.detail.value,this.durationUnit).toString();

    this.isValid.next(this.isRoomAvailable());

    this.updateCollisions();
  }

  updateDurationUnit($event:any){
    this.durationUnit = $event.detail.value;
    this.timeEnd = dayjs(this.timeStart).local().add(this.duration,$event.detail.value).toString();
    
    this.isValid.next(this.isRoomAvailable());

    this.updateCollisions();
  }

  updateRoom($event:any){
    this.isValid.next(this.isRoomAvailable($event.detail.value));
    
    this.updateCollisions();
  }

  isRoomAvailable(room_id:string=this.room_id){

    this.collisionIndexes = this.multiCollisions.map((e:any) => {
      return e.collisions.findIndex((coll:any) => coll['room_id'] == room_id);
    })
    
    return !this.collisionIndexes.some(positive);
  }


  removeDay(index:number){
    if(this.selectedDays.length > 1){
      this.selectedDays.splice(index,1);
      this.isValid.next(this.selectedDays.length > 0);
      this.updateCollisions()
      this.dayRemoveEvent.emit(index);
    }
  }
}
const positive = (element:number) => element >= 0;
