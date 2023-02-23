import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { DocumentData } from 'firebase/firestore';
import { firstValueFrom, Observable } from 'rxjs';
import { AngularfireService, UserInfos } from 'src/app/shared/service/angularfire.service';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';


@Component({
  selector: 'app-student-modal',
  templateUrl: './student-modal.component.html',
  styleUrls: ['./student-modal.component.scss']
})
export class StudentModalComponent {
  meta!:any;
  title!:string;
  dataObs!:Observable<DocumentData|undefined>;
  creator!:DocumentData|undefined;
  date!:string;

  participants!:number;
  max_participants!:number;

  isAttending!:boolean;
  isCourseFull!:boolean;
  isSubscribtionBlocked!:boolean;

  constructor(private modalCtrl: ModalController,private readonly _db: AngularfireService,private readonly _user:UsermanagementService) { }
  
  async ionViewWillEnter(){
    this.dataObs = this._db.getCalendarEntry(this.meta.id);

    let courseActualValues = await firstValueFrom(this.dataObs);

    if(courseActualValues){
      this.isAttending = courseActualValues['attendantsId'].includes(this._user.getId());
  
      this.isCourseFull = courseActualValues['attendantsId'].length >= courseActualValues['max_participants'];

      this.isSubscribtionBlocked = (this.isCourseFull && !this.isAttending) || !this._user.isLogged.value || this._user.isBanned();
      
      this.creator = await this._db.getUser(courseActualValues['author']);

      this.participants = courseActualValues['attendantsId'].length;
      this.max_participants = courseActualValues['max_participants'];
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
