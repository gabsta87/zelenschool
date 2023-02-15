import { Component } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { DocumentData } from 'firebase/firestore';
import { firstValueFrom, Observable } from 'rxjs';
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
  creator!:UserInfos|undefined;

  isAuthor!:boolean;
  isAdmin!:boolean;
  isDisabled!:boolean;

  constructor(
    private modalCtrl: ModalController,
    private readonly _db: AngularfireService,
    private readonly _user:UsermanagementService,
    private actionSheetCtrl: ActionSheetController) { }
  
  async ionViewWillEnter(){
    this.dataObs = this._db.getCalendarEntry(this.meta.id);

    let actualValue = await firstValueFrom(this.dataObs);

    this.id = this.meta.id;
    this.room_id = this.meta.room_id;
    this.time = this.meta.time;
    this.max_participants = this.meta.max_participants;

    console.log("meta : ",this.meta);
    

    this.isAuthor = actualValue ? actualValue['author'] == this._user.getId() : false;
    this.isAdmin = this._user.isAdmin();
    // this.isDisabled = !this.isAuthor && !this.isAdmin;
    this.isDisabled = !this.isAuthor;
    
    if(actualValue){
      this.creator = await this._db.getUser(actualValue['author']);
      this.creatorName = this.creator?.f_name+" "+this.creator?.l_name
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

  updateTime($event:any){
    this.time = $event.detail.value;
  }
}
