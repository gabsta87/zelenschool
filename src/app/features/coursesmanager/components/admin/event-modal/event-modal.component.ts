import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-event-modal',
  templateUrl: './event-modal.component.html',
  styleUrls: ['./event-modal.component.scss']
})
export class EventModalComponent {

  id!: string;
  galleryId!: string;
  leafletLink!: string;
  location!: string;
  name!: string;
  participants!: string;
  timeStart!: string;
  timeEnd!: string;

  // loadingFinished = new BehaviorSubject(false);

  constructor(
    private readonly modalCtrl: ModalController,
  ) { }

  // ionViewDidEnter(){
  //   console.log("time start : ",this.timeStart);
  //   console.log("time end : ",this.timeEnd);
  //   this.loadingFinished.next(true);
  // }

  confirm() {
    let entry = {
      id: this.id,
      name: this.name,
      location: this.location,
      participants: this.participants,
      timeStart: this.timeStart,
      timeEnd: this.timeEnd,
      galleryId: this.galleryId,
    }

    return this.modalCtrl.dismiss(entry, 'confirm');
  }

  cancel() {
    return this.modalCtrl.dismiss(undefined, 'cancel');
  }

}
