import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { DocumentData } from 'firebase/firestore';
import { firstValueFrom, Observable } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';


@Component({
  selector: 'app-student-modal',
  templateUrl: './student-modal.component.html',
  styleUrls: ['./student-modal.component.scss']
})
export class StudentModalComponent {
  meta!:any;
  dataObs!:Observable<DocumentData|undefined>;

  title!:string;
  creator!:DocumentData|undefined;

  isAttending!:boolean;
  isCourseFull!:boolean;
  isSubscribtionBlocked!:boolean;

  constructor(private modalCtrl: ModalController,private readonly _db: AngularfireService,private readonly _user:UsermanagementService) { }
  
  async ionViewWillEnter(){
    this.dataObs = this._db.getCalendarEntry(this.meta.id);

    let courseActualValues = await firstValueFrom(this.dataObs);

    if(courseActualValues){

      this.creator = await this._db.getUser(courseActualValues['author']);

      this.isAttending = courseActualValues['attendantsId'].includes(this._user.getId());
      this.isCourseFull = courseActualValues['attendantsId'].length >= courseActualValues['max_participants'];

      this.isSubscribtionBlocked = 
        // The course is full
        (this.isCourseFull && !this.isAttending) || 
        
        // User is not logged
        !this._user.isLogged.value || 

        // User is banned
        this._user.isBanned() ||

        // Date is already passed
        dayjs(courseActualValues['eventDate']).isBefore(new Date()) ;
    }
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  confirm(){
    if(!this._user.isBanned())
      this._db.toggleSubscribtionToCalendarEntry(this.meta.id, this.isAttending);
    return this.modalCtrl.dismiss(null, 'confirm');
  }
}
