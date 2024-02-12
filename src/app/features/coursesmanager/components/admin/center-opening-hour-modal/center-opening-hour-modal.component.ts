import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-center-opening-hour-modal',
  templateUrl: './center-opening-hour-modal.component.html',
  styleUrls: ['./center-opening-hour-modal.component.scss']
})
export class CenterOpeningHourModalComponent {

  dailySchedule!:string;

  constructor(private readonly _modalCtrl : ModalController){}

  cancel(){
    return this._modalCtrl.dismiss(null, 'cancel');
  }

  confirm(){
    return this._modalCtrl.dismiss(this.dailySchedule, 'confirm');
  }
}
