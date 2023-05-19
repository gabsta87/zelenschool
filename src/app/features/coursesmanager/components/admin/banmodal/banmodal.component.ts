import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-banmodal',
  templateUrl: './banmodal.component.html',
  styleUrls: ['./banmodal.component.scss']
})
export class BanmodalComponent {
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
