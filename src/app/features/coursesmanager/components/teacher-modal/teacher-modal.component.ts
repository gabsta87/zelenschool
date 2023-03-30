import { Component } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { DocumentData } from 'firebase/firestore';
import { BehaviorSubject, firstValueFrom, map, Observable, switchMap } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { formatTime, getNowDate, HourManagementService } from 'src/app/shared/service/hour-management.service';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';

@Component({
  selector: 'app-teacher-modal',
  templateUrl: './teacher-modal.component.html',
  styleUrls: ['./teacher-modal.component.scss']
})
export class TeacherModalComponent{
  id!:string;
  title!:string;
  room_id!:string;
  timeStart!:string;
  timeEnd!:string;
  max_participants!:number;
  meta!:any;
  creatorName:string = "";
  description:string = "";

  now = getNowDate();
  duration = 1;
  durationUnit = 'hour' as dayjs.ManipulateType;

  presentingElement = undefined;
  dataObs!:Observable<DocumentData|undefined>;
  creator!:DocumentData|undefined;

  isAuthor!:boolean;
  isAdmin!:boolean;
  cannotModify!:boolean;
  isPassedEvent!:boolean;

  constructor(
    private readonly modalCtrl: ModalController,
    private readonly _db: AngularfireService,
    private readonly _user:UsermanagementService,
    private readonly actionSheetCtrl: ActionSheetController,
    private readonly timeManager : HourManagementService,
  ) { }
  
  async ionViewWillEnter(){
    this.dataObs = this._db.getCalendarEntry(this.meta.id);

    const actualValue = await firstValueFrom(this.dataObs);

    this.dataObs = this.dataObs.pipe(
      switchMap(async (entry:any) => {

        if(!entry)
          return;

        // Getting users IDs
        const usersIds = entry.attendantsId;

        // Getting users infos
        const usersInfos = await Promise.all(entry.attendantsId.map((id:string) => this._db.getUser(id)));

        // Replace IDs by users 
        entry.attendantsId.forEach((usr:string,index:number) =>{
          entry.attendantsId[index] = usersInfos.find((e:any) => e && e.id ? e.id == usr : false);
          
          // Determining if the user was absent from this course
          if(entry.attendantsId[index])
            entry.attendantsId[index].isAbsent = entry.attendantsId[index].missedCourses != undefined && entry.attendantsId[index].missedCourses.includes(this.meta.id)
        })

        return entry;
      })
    );

    this.id = this.meta.id;
    this.room_id = this.meta.room_id;
    this.timeStart = formatTime(this.meta.timeStart);
    this.timeEnd = formatTime(this.meta.timeEnd);
    this.max_participants = this.meta.max_participants;
    this.description = this.meta.description;

    this.duration = dayjs(this.timeEnd).diff(this.timeStart,"minute");
    if(this.duration < 60 || this.duration % 60 != 0){
      this.durationUnit = "minute"
    }else{
      this.duration = dayjs(this.timeEnd).diff(this.timeStart,"hour");
      this.durationUnit = "hour"
    }

    this.isAuthor = actualValue ? actualValue['author'] == this._user.getId() : false;
    this.isAdmin = this._user.isAdmin();
    this.isPassedEvent = dayjs(this.timeStart).isBefore(getNowDate()) ;

    // USE THIS VERSION FOR FINAL RELEASE
    // this.cannotModify = (!this.isAuthor || this.isPassedEvent ) && !this.isAdmin;

    // TEMPORARY FOR TESTING
    this.cannotModify = !this.isAuthor || this.isPassedEvent;
    
    if(actualValue){
      this.creator = await this._db.getUser(actualValue['author']);
      if(this.creator)
        this.creatorName = this.creator['f_name']+" "+this.creator['l_name'];
    }
  }

  statusChanged($event:any){
    this._db.toggleSubscribtionToCalendarEntry(this.meta.id, $event.detail.checked);
  }

  canDismiss = async () => {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Are you sure?',
      buttons: [
        {
          text: 'Delete',
          role: 'confirm',
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();

    return role === 'confirm';
  };
  
  async deleteEntry(){
    if(!(this._user.isAdmin)){
      console.log("Only admins can remove a course");
      return;
    }

    let response = await this.canDismiss();
    if(!response)
      return;

    this._db.deleteCalendarEntry(this.meta.id);
    return this.modalCtrl.dismiss(null, 'delete');
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm(){
    let entry = {id:this.id,title:this.title,timeStart:formatTime(this.timeStart),timeEnd:formatTime(this.timeEnd),room_id:this.room_id,max_participants:this.max_participants,description:this.description?this.description:""}
    
    this._db.updateCalendarEntry(entry);
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  isRoomAvailable = new BehaviorSubject<Boolean>(true);
  collisionEventsObs!:any;
  collisionEvents!:DocumentData[]|undefined;
  collisionIndex !: number;

  async updateTime(){
    this.collisionEvents = await firstValueFrom(this._db.getCalendarEntriesCollisions(this.timeStart,this.timeEnd,this.id));

    if(this.collisionEvents){
      this.collisionIndex = this.collisionEvents.findIndex(e => e['room_id'] == this.room_id);
      this.isRoomAvailable.next(this.collisionIndex == -1)
    }else{
      this.isRoomAvailable.next(true);
    }
   
  }

  updateTimeStart($event:any){
    // console.log("time start : ",this.timeStart);
    // console.log("event : ",$event.detail.value);
    // // let 
    // // this.timeStart = dayjs($event.detail.value).hour
    // let hour = dayjs($event.detail.value).hour();
    // let minute = dayjs($event.detail.value).minute();
    // let year = dayjs($event.detail.value).year();
    // let month = dayjs($event.detail.value).month();
    // let day = dayjs($event.detail.value).day();
    // let myStr = ""+year+"-"+month+"-"+day+"T"+hour+":"+minute+":00.000.Z";
    // let myDate = new Date(Date.UTC(year=year,month=month,day=day,hour=hour,minute=minute));
    // console.log("hour : ",hour);
    
    // console.log("my str : ",myStr);
    // console.log("my date : ",myDate);
    
    
    // // this.timeStart = dayjs(myDate).toISOString();
    // // this.timeStart = formatTime($event.detail.value);

    // console.log("After change time start : ",this.timeStart);
    // console.log("After change event : ",$event.detail.value);
    this.timeStart = formatTime($event.detail.value);
    this.timeEnd = formatTime(dayjs(this.timeStart).add(this.duration,this.durationUnit));

    console.log("time start : ",this.timeStart);
    console.log("time end : ",this.timeEnd);

    return this.updateTime();
  }
  
  updateDuration($event:any){
    // this.duration = $event.detail.value;
    this.timeEnd = formatTime(dayjs(this.timeStart).add($event.detail.value,this.durationUnit));

    return this.updateTime();
  }

  updateDurationUnit($event:any){
    // this.durationUnit = $event.detail.value;
    this.timeEnd = formatTime(dayjs(this.timeStart).add(this.duration,$event.detail.value));
   
    return this.updateTime();
  }

  setStudentAbsent($event:any,userId:string){
    this._db.toggleUserAbsent($event.detail.checked,userId,this.id);
  }

  updateRoom($event:any){
    // If there are no events at the same time, no validation required
    if(!this.collisionEvents){
      return
    }
    
    this.collisionIndex = this.collisionEvents.findIndex(e => e['room_id'] == $event.detail.value);
    this.isRoomAvailable.next(this.collisionIndex == -1)
  }
}
