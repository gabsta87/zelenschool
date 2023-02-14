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
  creator!:UserInfos|undefined;
  date!:string;

  isAttending!:boolean;

  constructor(private modalCtrl: ModalController,private readonly _db: AngularfireService,private readonly _user:UsermanagementService) {
  }
  
  async ionViewWillEnter(){
    console.log("author id : ",this.meta.authorId);
    
    this.dataObs = this._db.getCalendarEntry(this.meta.id);

    let actualValue = await firstValueFrom(this.dataObs);

    this.isAttending = actualValue ? actualValue['attendantsId'].includes(this._user.getId()) : false;
    
    if(actualValue){
      this.creator = await this._db.getUser(actualValue['author']);
    }

  }

  confirm(){
    return this.modalCtrl.dismiss(null, 'confirm');
  }

  statusChanged($event:any){
    this._db.toggleSubscribtionToCalendarEntry(this.meta.id, $event.detail.checked);
  }
}
