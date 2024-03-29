import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DocumentData } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { UserInfos } from 'src/app/shared/service/angularfire.service';
import { LanguageManagerService } from 'src/app/shared/service/language-manager.service';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';
import { bdValidator, emailValidator,permitValidator,phoneValidator } from 'src/app/shared/service/validators-lib.service';
import { ChildCreationModalComponent } from '../child-creation-modal/child-creation-modal.component';

@Component({
  selector: 'app-accountpage',
  templateUrl: './accountpage.component.html',
  styleUrls: ['./accountpage.component.scss']
})
export class AccountpageComponent {
  userData : {user:UserInfos,userObs:Observable<DocumentData|undefined>} = this._route.snapshot.data['userData'];

  words$ = this._lang.currentLanguage$;

  profileForm = new FormGroup({
    email : new FormControl(this.userData.user.email?this.userData.user.email:"",emailValidator()),
    f_name : new FormControl(this.userData.user.f_name?this.userData.user.f_name:"",Validators.required),
    l_name : new FormControl(this.userData.user.l_name?this.userData.user.l_name:"",Validators.required),
    phone : new FormControl(this.userData.user.phone?this.userData.user.phone:"",phoneValidator()),
    address : new FormControl(this.userData.user.address?this.userData.user.address:"",Validators.required),
    s_permit_number : new FormControl(this.userData.user.s_permit_id,permitValidator()),
    birthday : new FormControl(this.userData.user.birthday?this.userData.user.birthday:"",bdValidator()),
  });

  constructor(
    private readonly _user:UsermanagementService,
    private readonly _router:Router,
    private readonly _route:ActivatedRoute,
    private readonly _lang:LanguageManagerService,
    private readonly modalCtrl : ModalController,
  ){
  }

  async logout(){
    this._user.logout();
    this._router.navigate(['/login/']);
  }

  update(){
    let updateItem = {
      email : this.profileForm.get('email')?.value,
      l_name : this.profileForm.get('l_name')?.value,
      f_name : this.profileForm.get('f_name')?.value,
      phone : this.profileForm.get('phone')?.value,
      address : this.profileForm.get('address')?.value,
      s_permit_id : this.profileForm.get('s_permit_number')?.value,
      birthday : this.profileForm.get('birthday')?.value
    }
    this._user.updateUser(updateItem);
  }

  cancel(){
    this.profileForm.controls['email'].setValue(this.userData.user.email ? this.userData.user.email : "");
    this.profileForm.controls['f_name'].setValue(this.userData.user.f_name);
    this.profileForm.controls['l_name'].setValue(this.userData.user.l_name);
    this.profileForm.controls['phone'].setValue(this.userData.user.phone ? this.userData.user.phone : "");
    this.profileForm.controls['address'].setValue(this.userData.user.address ? this.userData.user.address : "");
    this.profileForm.controls['s_permit_number'].setValue(this.userData.user.s_permit_id);
    this.profileForm.controls['birthday'].setValue(this.userData.user.birthday ? this.userData.user.birthday : "");
  }

  deleteChild(id:string){
    this._user.deleteChild(id);
  }

  async addChild(){

    const modal = await this.modalCtrl.create({
      component: ChildCreationModalComponent
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this._user.addChild(data);
    }
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
