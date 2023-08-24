import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { LanguageManagerService } from 'src/app/shared/service/language-manager.service';
import { bdValidator, emailValidator, permitValidator, phoneValidator } from 'src/app/shared/service/validators-lib.service';

@Component({
  selector: 'app-complete-account-modal',
  templateUrl: './complete-account-modal.component.html',
  styleUrls: ['./complete-account-modal.component.scss']
})
export class CompleteAccountModalComponent implements OnInit{
  words$ = this._lang.currentLanguage$;
  userData!:any;

  status = (this.userData && this.userData.status) ? this.userData.status : "student";
  // statusDisabled = new BehaviorSubject(this.userData?.status != null);
  statusDisabled = true;

  formDataTeacher!:FormGroup<{
    email:FormControl<string|null>,
    lastName:FormControl<string|null>,
    firstName:FormControl<string|null>,
    phoneNumber:FormControl<string|null>,
  }>

  formDataStudent!:FormGroup<{
    email:FormControl<string|null>,
    lastName:FormControl<string|null>,
    firstName:FormControl<string|null>,
    phoneNumber:FormControl<string|null>,
    dateOfBirth:FormControl<string|null>,
    sPermitNumber:FormControl<string|null>,
    address:FormControl<string|null>
  }>;
  
  ngOnInit(){

    this.formDataStudent = new FormGroup({
      email: new FormControl<string>(((this.userData && this.userData.email) ? this.userData.email : ''),Validators.compose([
        emailValidator(),
        Validators.required
      ])),
      lastName: new FormControl<string>(((this.userData && this.userData.l_name) ? this.userData.l_name : ''),Validators.compose([
        Validators.required
      ])),
      firstName: new FormControl<string>(((this.userData && this.userData.f_name) ? this.userData.f_name : ''),Validators.compose([
        Validators.required
      ])),
      phoneNumber: new FormControl<string>(((this.userData && this.userData.phone) ? this.userData.phone : ''),Validators.compose([
        phoneValidator(),
        Validators.required
      ])),
      dateOfBirth: new FormControl<string>(((this.userData && this.userData.birthday) ? this.userData.birthday : ''),Validators.compose([
        bdValidator(),
        Validators.required
      ])),
      sPermitNumber: new FormControl<string>(((this.userData && this.userData.s_permit_number) ? this.userData.s_permit_number : ''),Validators.compose([
        permitValidator()
      ])),
      address: new FormControl<string>(((this.userData && this.userData.address) ? this.userData.address : ''),Validators.compose([
        Validators.required
      ])),
    });

    this.formDataTeacher = new FormGroup({
      email: new FormControl<string>(((this.userData && this.userData.email) ? this.userData.email : ''),Validators.compose([
        emailValidator(),
        Validators.required
      ])),
      lastName: new FormControl<string>(((this.userData && this.userData.l_name) ? this.userData.l_name : ''),Validators.compose([
        Validators.required
      ])),
      firstName: new FormControl<string>(((this.userData && this.userData.f_name) ? this.userData.f_name : ''),Validators.compose([
        Validators.required
      ])),
      phoneNumber: new FormControl<string>(((this.userData && this.userData.phone) ? this.userData.phone : ''))
    });

    this.formDataStudent.markAllAsTouched();
    this.formDataTeacher.markAllAsTouched();
  }

  constructor(private readonly modalController: ModalController, private readonly _lang:LanguageManagerService) { }

  register() {
    let returnData;

    if(this.status == "student"){
      returnData = {
        email:this.formDataStudent.get("email")?.value,
        l_name:this.formDataStudent.get("lastName")?.value,
        f_name:this.formDataStudent.get("firstName")?.value,
        phone:this.formDataStudent.get("phoneNumber")?.value,
        birthday:this.formDataStudent.get("dateOfBirth")?.value,
        s_permit_id:this.formDataStudent.get("sPermitNumber")?.value,
        address:this.formDataStudent.get("address")?.value,
      }
    }else{
      returnData = {
        email:this.formDataTeacher.get("email")?.value,
        l_name:this.formDataTeacher.get("lastName")?.value,
        f_name:this.formDataTeacher.get("firstName")?.value,
        phone:this.formDataTeacher.get("phoneNumber")?.value,
      }
    }

    // Dismiss the modal
    this.modalController.dismiss(returnData,this.status);
  }

  onDateInput(ev:any) {
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
    // this.formDataStudent.setValue({dateOfBirth:truncatedValue});
  }
}
