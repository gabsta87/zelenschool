import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-partner-modal',
  templateUrl: './partner-modal.component.html',
  styleUrls: ['./partner-modal.component.scss']
})
export class PartnerModalComponent {
  link = "";
  partnerLogo !: File;
  
  uploadingImage = false;
  photoChanged = new BehaviorSubject(false);
  tempImage = "/assets/members/anonymous.svg";

  constructor(private modalCtrl: ModalController){ }

  onFileSelected(event: any): void {
    this.photoChanged.next(true);
    const file: File = event.target.files[0];
    this.partnerLogo = file;

    this.tempImage = URL.createObjectURL(file);
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm(){
    return this.modalCtrl.dismiss({
      link:this.link,
      logoName:this.partnerLogo,
    }, 'confirm');
  }
}
