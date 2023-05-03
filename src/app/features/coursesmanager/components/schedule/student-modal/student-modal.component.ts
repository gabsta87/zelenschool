import { Component, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import dayjs from 'dayjs';
import { DocumentData } from 'firebase/firestore';
import { firstValueFrom, Observable } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { getNowDate } from 'src/app/shared/service/hour-management.service';
import { LanguageManagerService } from 'src/app/shared/service/language-manager.service';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';


@Component({
  selector: 'app-student-modal',
  templateUrl: './student-modal.component.html',
  styleUrls: ['./student-modal.component.scss']
})
export class StudentModalComponent {
  @ViewChild('popover') popover : any;
  meta!:any;
  dataObs!:Observable<DocumentData|undefined>;

  isPopoverOpen = false;

  title!:string;
  creator!:DocumentData|undefined;

  isAttending!:boolean;
  isCourseFull!:boolean;
  isSubscribtionBlocked!:boolean;
  ban = this._user.getUserData() ? this._user.getUserData().ban : null;
  showBanInfo = false;

  duration = 1;
  durationUnit!:dayjs.ManipulateType;

  words = this._lang.currentLanguage.schedule;

  constructor(private modalCtrl: ModalController,
    private readonly _db: AngularfireService,
    private readonly _user:UsermanagementService,
    private readonly _lang:LanguageManagerService
    ) { }
  
  async ionViewWillEnter(){
    this.dataObs = this._db.getCalendarEntry(this.meta.id);

    let courseActualValues = await firstValueFrom(this.dataObs);

    if(courseActualValues){

      this.creator = await this._db.getUser(courseActualValues['author']);

      this.isAttending = courseActualValues['attendantsId'].includes(this._user.getId());
      this.isCourseFull = courseActualValues['attendantsId'].length >= courseActualValues['max_participants'];

      this.duration = dayjs(courseActualValues['timeEnd']).diff(courseActualValues['timeStart'],"minute");
      if(this.duration < 60 || this.duration % 60 != 0){
        this.durationUnit = "minute"
      }else{
        this.duration = dayjs(courseActualValues['timeEnd']).diff(courseActualValues['timeStart'],"hour");
        this.durationUnit = "hour"
      }

      this.isSubscribtionBlocked = 
        // The course is full
        (this.isCourseFull && !this.isAttending) || 
        
        // User is not logged
        !this._user.isLogged.value || 

        // User is banned
        this._user.isBanned() ||

        // Date is already passed
        dayjs(courseActualValues['timeStart']).isBefore(getNowDate()) ||

        // Subscribed and 12 hours before course
        (this.isAttending && dayjs(courseActualValues['timeStart']).subtract(12,"hour").isBefore(getNowDate())) ||

        // Still possible to subscribe 12 hours after the course
        (!this.isAttending && dayjs(courseActualValues['timeStart']).add(12,"hour").isBefore(getNowDate()))
    }
  }

  ionViewDidEnter(){
    if(this.ban){
      this.showBanInfo = true;
    }
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  presentPopover() {
    this.isPopoverOpen = true;
  }

  confirm(){
    if(!this.isSubscribtionBlocked){
      this._db.toggleSubscribtionToCalendarEntry(this.meta.id, this.isAttending);
      if(this.isAttending){
        this.presentPopover();
      }
    }

    // if(!this._user.isBanned()){
    //   if(!(this.isAttending && dayjs(this.meta.timeStart).subtract(12,"hour").isBefore(getNowDate()))){
    //     this._db.toggleSubscribtionToCalendarEntry(this.meta.id, this.isAttending);
    //     if(this.isAttending)
    //       this.presentPopover();
    //   }
    // }
    return this.modalCtrl.dismiss(null, 'confirm');
  }
}
