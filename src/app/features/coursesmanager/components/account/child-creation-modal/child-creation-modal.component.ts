import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { LanguageManagerService } from 'src/app/shared/service/language-manager.service';
import { bdValidator } from 'src/app/shared/service/validators-lib.service';

@Component({
  selector: 'app-child-creation-modal',
  templateUrl: './child-creation-modal.component.html',
  styleUrls: ['./child-creation-modal.component.scss']
})
export class ChildCreationModalComponent {

  profileForm!:FormGroup<{
    birthday:FormControl<string|null>,
    l_name:FormControl<string|null>,
    f_name:FormControl<string|null>,
  }>;

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

  constructor(private readonly modalCtrl: ModalController, private readonly _lang:LanguageManagerService) {
    this.profileForm = new FormGroup({

      birthday: new FormControl('',Validators.compose([
        bdValidator(),
        Validators.required
      ])),

      l_name: new FormControl('',Validators.required),
      f_name: new FormControl('',Validators.required),
    });
  }

  cancel() {
    this.modalCtrl.dismiss(null,"cancel");
  }

  confirm(){
    let returnChild = {
      f_name:this.profileForm.get("f_name")?.value,
      l_name:this.profileForm.get("l_name")?.value,
      birthday:this.profileForm.get("birthday")?.value
    }
    return this.modalCtrl.dismiss(returnChild, "confirm");
  }

  onInput(ev:any) {
    const value = ev.target!.value;
    
    // Removes non alphanumeric characters
    const numeric = value.replace(/[^\d./]/, "");

    // Inserts dots
    const correctedValue = numeric.replace(/(?<=^\d{2})(\d)/g, ".$1");
    const correctedSecondLevel = correctedValue.replace(/(?<=^\d{2}\.\d{2})(\d)/g, ".$1");

    // Blocks extra characters
    const truncatedValue = correctedSecondLevel.replace(/(?<=(?:^\d{2}[./]\d{2}[./]\d{4}))./g,"")

    /**
     * Update both the state variable and
     * the component to keep them in sync.
     */
    ev.target.value = truncatedValue;
    this.profileForm.get("birthday")?.setValue(truncatedValue);
  }
}
