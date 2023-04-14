import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-gallery-name-modal',
  templateUrl: './gallery-name-modal.component.html',
  styleUrls: ['./gallery-name-modal.component.scss']
})
export class GalleryNameModalComponent {
  name: string = '';

  constructor(private modalCtrl: ModalController) { }

  cancel() {
    this.modalCtrl.dismiss(null,"cancel");
  }

  confirm(){
    this.modalCtrl.dismiss(this.name,"confirm");
  }
}
