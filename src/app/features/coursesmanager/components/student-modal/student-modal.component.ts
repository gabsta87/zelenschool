import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-student-modal',
  templateUrl: './student-modal.component.html',
  styleUrls: ['./student-modal.component.scss']
})
export class StudentModalComponent {
  author!:string;
  authorName!:string;
  hours!:string;
  isAttending!:boolean;
  banEndDate!:boolean;

  constructor(private modalCtrl: ModalController) {}
  
  cancel(){
    console.log("author : ",this.author);
    
    this.modalCtrl.dismiss(null, 'cancel');
  }
  
  confirm(){
    console.log("author : ",this.author);

    return this.modalCtrl.dismiss(null, 'confirm');
  }


  onWillDismiss(event: Event) {
    const ev = event as CustomEvent;
    console.log("event : ",event);
    
  }
}
