import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

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

  constructor(
    private readonly modalCtrl: ModalController,
  ) { }

  confirm() {
    let entry = {
      id: this.id,
      name: this.name,
      location: this.location ? this.location : "",
      participants: this.participants ? this.participants : "",
      timeStart: this.timeStart ? this.timeStart : "",
      timeEnd: this.timeEnd ? this.timeEnd : "",
      galleryId: this.galleryId ? this.galleryId : "",
    }

    return this.modalCtrl.dismiss(entry, 'confirm');
  }

  cancel() {
    return this.modalCtrl.dismiss(undefined, 'cancel');
  }

}
