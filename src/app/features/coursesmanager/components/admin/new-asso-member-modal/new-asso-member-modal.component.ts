import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-new-asso-member-modal',
  templateUrl: './new-asso-member-modal.component.html',
  styleUrls: ['./new-asso-member-modal.component.scss']
})
export class NewAssoMemberModalComponent {
  assoMemberName = "";
  assoMemberRole = "";
  assoMemberLink = "";
  assoMemberPhoto !: File;
  
  uploadingImage = false;
  photoChanged = new BehaviorSubject(false);
  tempImage = "/assets/members/anonymous.svg";

  constructor(private modalCtrl: ModalController){ }

  onFileSelected(event: any): void {
    this.photoChanged.next(true);
    const file: File = event.target.files[0];
    this.assoMemberPhoto = file;

    this.tempImage = URL.createObjectURL(file);
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm(){
    return this.modalCtrl.dismiss({
      name:this.assoMemberName,
      link:this.assoMemberLink,
      photo:this.assoMemberPhoto,
      role:this.assoMemberRole,
    }, 'confirm');
  }
}
