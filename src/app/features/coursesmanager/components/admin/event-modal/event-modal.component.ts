import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from 'src/app/shared/service/storage.service';

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
    private readonly _storage : StorageService,
  ) {
    // this.profileForm = new FormGroup({
    //   timeStart: new FormControl('',
    //   ])),

    // })
  }

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
