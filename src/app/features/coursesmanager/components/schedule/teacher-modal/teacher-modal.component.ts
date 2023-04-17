import { Component } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { DocumentData } from 'firebase/firestore';
import { BehaviorSubject, firstValueFrom, Observable, switchMap } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { formatForIonDateTime, getNowDate } from 'src/app/shared/service/hour-management.service';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';

@Component({
  selector: 'app-teacher-modal',
  templateUrl: './teacher-modal.component.html',
  styleUrls: ['./teacher-modal.component.scss']
})
export class TeacherModalComponent{
  meta!:any;
  title!:string;
  room_id!:string;
  timeStart!:string;
  timeEnd!:string;
  max_participants!:number;
  creatorName:string = "";
  description:string = "";

  now = getNowDate();
  duration = 1;
  durationUnit = 'hour' as dayjs.ManipulateType;
  defaultHour !: number;
  defaultMinute !: number;

  presentingElement = undefined;
  dataObs!:Observable<DocumentData|undefined>;
  rooms = this._db.getRooms();
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
  ) { }
  
  async ionViewWillEnter(){
    this.dataObs = this._db.getCalendarEntry(this.meta.id);

    const actualValue = await firstValueFrom(this.dataObs);

    this.dataObs = this.dataObs.pipe(
      switchMap(async (entry:any) => {
        
        if(!entry)
          return;

        // Getting users IDs
        entry.room = await this._db.getRoom(entry.room_id);

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

    this.timeStart = formatForIonDateTime(this.meta.timeStart);
    this.timeEnd = formatForIonDateTime(this.meta.timeEnd);
    this.max_participants = this.meta.max_participants;
    this.description = this.meta.description;

    this.defaultHour = dayjs(this.timeStart).hour();
    this.defaultMinute = dayjs(this.timeStart).minute();

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
    this.cannotModify = (!this.isAuthor || this.isPassedEvent ) && !this.isAdmin;

    // TEMPORARY FOR TESTING : Admin cannot modify course which are not his own
    // this.cannotModify = !this.isAuthor || this.isPassedEvent;
    
    if(actualValue){
      this.creator = await this._db.getUser(actualValue['author']);
      if(this.creator)
        this.creatorName = this.creator['f_name']+" "+this.creator['l_name'];
    }
  }

  ionViewDidEnter(){
    this.room_id = this.meta.room_id;
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
    let entry = {
      id:this.meta.id,
      title:this.title,
      timeStart:this.timeStart,
      timeEnd:this.timeEnd,
      room_id:this.room_id,
      max_participants:this.max_participants,
      description:this.description,
    }
    
    this._db.updateCalendarEntry(entry);
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  isRoomAvailable = new BehaviorSubject<Boolean>(true);
  collisionEventsObs!:any;
  collisionEvents!:DocumentData[]|undefined;
  collisionIndex !: number;

  async updateTime(){
    this.collisionEvents = await firstValueFrom(this._db.getCalendarEntriesCollisions(this.timeStart,this.timeEnd,this.meta.id));

    if(this.collisionEvents){
      this.collisionIndex = this.collisionEvents.findIndex(e => e['room_id'] == this.room_id);
      this.isRoomAvailable.next(this.collisionIndex == -1)
    }else{
      this.isRoomAvailable.next(true);
    }
  }


  updateStartingHour($event:any){
    let newValue = $event.detail.value;

    this.timeStart = dayjs(this.timeStart).hour(newValue).toString();
    this.timeEnd = dayjs(this.timeStart).add(this.duration,this.durationUnit).toString();
    this.updateTime();
  }

  updateStartingMinute($event:any){
    let newValue = $event.detail.value;
    
    this.timeStart = dayjs(this.timeStart).minute(newValue).toString();
    this.timeEnd = dayjs(this.timeStart).add(this.duration,this.durationUnit).toString();
    this.updateTime();
  }
  
  updateDuration($event:any){
    this.duration = $event.detail.value;
    this.timeEnd = dayjs(this.timeStart).add($event.detail.value,this.durationUnit).toString();

    return this.updateTime();
  }

  updateDurationUnit($event:any){
    this.durationUnit = $event.detail.value;
    this.timeEnd = dayjs(this.timeStart).add(this.duration,$event.detail.value).toString();
    
    return this.updateTime();
  }

  setStudentAbsent($event:any,userId:string){
    this._db.toggleUserAbsent($event.detail.checked,userId,this.meta.id);
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
