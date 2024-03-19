import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-ban-modal',
  templateUrl: './ban-modal.component.html',
  styleUrls: ['./ban-modal.component.scss']
})
export class BanModalComponent {
  explanation = "";

  constructor(
    private modalCtrl: ModalController,
  ){ }

  cancel(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm(){
    return this.modalCtrl.dismiss(this.explanation, 'confirm');
  }
}
