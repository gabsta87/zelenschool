import { Component } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { DocumentData } from 'firebase/firestore';
import { BehaviorSubject, combineLatest, firstValueFrom, map, Observable, switchMap } from 'rxjs';
import { AngularfireService, UserInfos } from 'src/app/shared/service/angularfire.service';
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
  time!:string;
  max_participants!:number;
  meta!:any;
  creatorName!:string;

  presentingElement = undefined;
  dataObs!:Observable<DocumentData|undefined>;
  creator!:DocumentData|undefined;

  isAuthor!:boolean;
  isAdmin!:boolean;
  cannotModify!:boolean;

  constructor(
    private modalCtrl: ModalController,
    private readonly _db: AngularfireService,
    private readonly _user:UsermanagementService,
    private actionSheetCtrl: ActionSheetController
    ) { }
  
  async ionViewWillEnter(){
    this.dataObs = this._db.getCalendarEntry(this.meta.id);

    let actualValue = await firstValueFrom(this.dataObs);

    this.dataObs = this.dataObs.pipe(
      switchMap((entry:any) => {
        const observables = entry.attendantsId.map((id:string) => {
          return this._db.getUserObs(id);
        });
        return combineLatest(observables).pipe(
          map((users:any) => {
            entry.attendantsId.forEach((id:string, i:number) => {
              entry.attendantsId[i] = users[i];
            });
            return entry;
          })
        );
      })
    );

    this.id = this.meta.id;
    this.room_id = this.meta.room_id;
    this.time = this.meta.time;
    this.max_participants = this.meta.max_participants;

    this.isAuthor = actualValue ? actualValue['author'] == this._user.getId() : false;
    this.isAdmin = this._user.isAdmin();

    // USE THIS VERSION FOR FINAL RELEASE
    // this.cannotModify = !this.isAuthor && !this.isAdmin;

    // TEMPORARY FOR TESTING
    this.cannotModify = !this.isAuthor;
    
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
    let entry = {id:this.id,title:this.title,eventDate:this.time,room_id:this.room_id,max_participants:this.max_participants}
    this._db.updateCalendarEntry(entry);
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  isRoomAvailable = new BehaviorSubject<Boolean>(true);
  collisionEventsObs!:any;
  collisionEvents!:DocumentData[]|undefined;
  collisionIndex !: number;

  async updateTime($event:any){

    this.collisionEventsObs = this._db.getCalendarEntryByTime(dayjs($event.detail.value));

    this.collisionEventsObs = this.collisionEventsObs.pipe(map((e:any) => e.filter((elem:any)=> elem['id'] != this.id))) 

    this.collisionEvents = await firstValueFrom(this.collisionEventsObs);
    console.log("collistion events ", this.collisionEvents);
    
    if(this.collisionEvents){
      this.collisionIndex = this.collisionEvents.findIndex(e => e['room_id'] == this.room_id);
      this.isRoomAvailable.next(this.collisionIndex == -1)
    }else{
      this.isRoomAvailable.next(true);
    }
    this.time = $event.detail.value;
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
