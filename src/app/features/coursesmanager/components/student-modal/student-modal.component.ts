import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-student-modal',
  templateUrl: './student-modal.component.html',
  styleUrls: ['./student-modal.component.scss']
})
export class StudentModalComponent {
  author!:{};
  title!:string;
  room!:number;
  time!:string;
  isAttending!:boolean;
  banEndDate!:boolean;

  constructor(private modalCtrl: ModalController) {
    console.log("author : ",this.author);
  }

  confirm(){
    console.log("author : ",this.author);

    return this.modalCtrl.dismiss(null, 'confirm');
  }

  statusChanged($event:any){
    console.log("checked : ",$event.detail.checked)

  }
  
}
