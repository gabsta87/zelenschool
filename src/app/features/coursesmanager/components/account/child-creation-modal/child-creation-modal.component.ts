import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageManagerService } from 'src/app/shared/service/language-manager.service';

@Component({
  selector: 'app-child-creation-modal',
  templateUrl: './child-creation-modal.component.html',
  styleUrls: ['./child-creation-modal.component.scss']
})
export class ChildCreationModalComponent {
  child: {
    f_name: string,
    l_name: string,
    birthday: string
  } = {
    f_name: '',
    l_name: '',
    birthday: ''
  };

  words$ = this._lang.currentLanguage$;

  constructor(private readonly modalCtrl: ModalController, private readonly _lang:LanguageManagerService) { }

  cancel() {
    this.modalCtrl.dismiss(null,"cancel");
  }

  confirm(){
    return this.modalCtrl.dismiss(this.child, "confirm");
  }
}
