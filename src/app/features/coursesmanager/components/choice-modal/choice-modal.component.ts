import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-choice-modal',
  templateUrl: './choice-modal.component.html',
  styleUrls: ['./choice-modal.component.scss']
})
export class ChoiceModalComponent {
  constructor(private modalCtrl: ModalController) { }

  confirmStudent(){
    return this.modalCtrl.dismiss(null, 'student');
  }
  
  confirmTeacher(){
    return this.modalCtrl.dismiss(null, 'teacher');
  }

}
