import { Component, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import dayjs from 'dayjs';
import { DocumentData } from 'firebase/firestore';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { AngularfireService, UserInfos } from 'src/app/shared/service/angularfire.service';
import { getNowDate } from 'src/app/shared/service/hour-management.service';
import { LanguageManagerService } from 'src/app/shared/service/language-manager.service';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';


@Component({
  selector: 'app-student-modal',
  templateUrl: './student-modal.component.html',
  styleUrls: ['./student-modal.component.scss']
})
export class StudentModalComponent {
  @ViewChild('popover') popover: any;
  meta!: any;
  calendarEntries$!: Observable<DocumentData | undefined>;

  isPopoverOpen = false;

  title!: string;
  creator!: DocumentData | undefined;

  isParent !: BehaviorSubject<boolean>;
  isAttending!: boolean;
  isChildAttending : boolean[] = [];
  isCourseFull!: boolean;
  isSubscribtionBlocked!: boolean;
  ban = this._user.getUserData() ? this._user.getUserData().ban : null;
  currentUser = this._user.getUserData();
  // TODO load names
  showBanInfo = false;

  courseActualValues !:any; 

  duration = 1;
  durationUnit!: dayjs.ManipulateType;

  words$ = this._lang.currentLanguage$;

  constructor(private modalCtrl: ModalController,
    private readonly _db: AngularfireService,
    private readonly _user: UsermanagementService,
    private readonly _lang: LanguageManagerService
  ) { }

  async ionViewWillEnter() {
    
    // Loading children infos
    if(this.currentUser &&  this.currentUser.children && this.currentUser.children.length > 0){
      
      this.currentUser.childrenInfos = await Promise.all(this.currentUser.children.map((childId: string) => this._db.getUser(childId)));
    }
    
    this.calendarEntries$ = this._db.getCalendarEntry(this.meta.id);

    this.courseActualValues = await firstValueFrom(this.calendarEntries$);

    if (this.courseActualValues) {

      this.creator = await this._db.getUser(this.courseActualValues['author']);

      this.isAttending = this.courseActualValues['attendantsId'].includes(this._user.getId());
      this.isCourseFull = this.courseActualValues['attendantsId'].length >= this.courseActualValues['max_participants'];

      this.isParent = this._user.isParent;

      // Checking if children are subscribed in the course
      if(this.currentUser && this.currentUser.childrenInfos && this.currentUser.childrenInfos.length > 0){
        this.currentUser.childrenInfos.forEach((child:any) => {
          this.isChildAttending.push(this.courseActualValues['attendantsId'].includes(child['id']))
        })
      }

      this.duration = dayjs(this.courseActualValues['timeEnd']).diff(this.courseActualValues['timeStart'], "minute");
      if (this.duration < 60 || this.duration % 60 != 0) {
        this.durationUnit = "minute"
      } else {
        this.duration = dayjs(this.courseActualValues['timeEnd']).diff(this.courseActualValues['timeStart'], "hour");
        this.durationUnit = "hour"
      }

      this.isSubscribtionBlocked =
        // The course is full
        (this.isCourseFull && !this.isAttending) ||

        // User is not logged
        (!this._user.isLogged.value || !this.currentUser )||

        // Date is already passed
        dayjs(this.courseActualValues['timeStart']).isBefore(getNowDate()) ||

        // Subscribed and 12 hours before course
        (this.isAttending && dayjs(this.courseActualValues['timeStart']).subtract(12, "hour").isBefore(getNowDate())) ||

        // Still possible to subscribe 12 hours after the course
        (!this.isAttending && dayjs(this.courseActualValues['timeStart']).add(12, "hour").isBefore(getNowDate()))
    }
  }

  ionViewDidEnter() {
    if (this.ban) {
      this.showBanInfo = true;
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  presentPopover() {
    this.isPopoverOpen = true;
  }

  async confirm() {
    if (!this.isSubscribtionBlocked) {
      this._db.toggleSubscribtionToCalendarEntryForCurrentUser(this.meta.id, this.isAttending);
      if (this.isAttending) {
        this.presentPopover();
      }
    }

    // Children management
    if(this.currentUser.childrenInfos){
      
      this.currentUser.childrenInfos.forEach((child:any,index:number) => {
        this._db.toggleSubscribtionToCalendarEntry(child['id'],this.meta.id,this.isChildAttending[index] && !child['ban']);
      })
    }

    return this.modalCtrl.dismiss(null, 'confirm');
  }
}
