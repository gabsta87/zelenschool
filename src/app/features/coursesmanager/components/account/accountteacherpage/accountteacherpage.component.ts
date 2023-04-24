import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { LanguageManagerService } from 'src/app/shared/service/language-manager.service';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';
import { emailValidator,phoneValidator,passwordValidator } from 'src/app/shared/service/validators-lib.service';

@Component({
  selector: 'app-accountteacherpage',
  templateUrl: './accountteacherpage.component.html',
  styleUrls: ['./accountteacherpage.component.scss']
})
export class AccountteacherpageComponent {

  userData = this._route.snapshot.data['userData'];
  userObs!:Observable<any>;

  words = this._lang.currentLanguage.account;
  
  constructor(
    private readonly _user:UsermanagementService,
    private readonly _router:Router,
    private readonly _route:ActivatedRoute,
    private readonly _lang:LanguageManagerService
  ){ }

  profileForm = new FormGroup({
    email : new FormControl(this.userData.user.email?this.userData.user.email:"",emailValidator()),
    f_name : new FormControl(this.userData.user.f_name?this.userData.user.f_name:"",Validators.required),
    l_name : new FormControl(this.userData.user.l_name?this.userData.user.l_name:"",Validators.required),
    phone : new FormControl(this.userData.user.phone?this.userData.user.phone:"",phoneValidator()),
    experience : new FormControl(this.userData.user.experience?this.userData.user.experience:""),
    students_age : new FormControl(this.userData.user.students_age?this.userData.user.students_age:"")
  })

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
      experience : this.profileForm.get('experience')?.value,
      students_age : this.profileForm.get('students_age')?.value,
    };
    this._user.updateUser(updateItem);
  }

  cancel(){
    this.profileForm.controls['email'].setValue(this.userData.user.email);
    this.profileForm.controls['f_name'].setValue(this.userData.user.f_name);
    this.profileForm.controls['l_name'].setValue(this.userData.user.l_name);
    this.profileForm.controls['phone'].setValue(this.userData.user.phone);
    this.profileForm.controls['experience'].setValue(this.userData.user.experience);
    this.profileForm.controls['students_age'].setValue(this.userData.user.students_age);
  }


}
