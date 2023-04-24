import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageManagerService } from 'src/app/shared/service/language-manager.service';

@Component({
  selector: 'app-choice-modal',
  templateUrl: './choice-modal.component.html',
  styleUrls: ['./choice-modal.component.scss']
})
export class ChoiceModalComponent {
  constructor(private readonly modalCtrl: ModalController,private readonly _lang:LanguageManagerService) { }

  words = this._lang.currentLanguage.account;

  confirm(role : string){
    return this.modalCtrl.dismiss(null, role);
  }

}
