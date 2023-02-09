import { Component } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first, firstValueFrom, map, Observable } from 'rxjs';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';

@Component({
  selector: 'app-accountpage',
  templateUrl: './accountpage.component.html',
  styleUrls: ['./accountpage.component.scss']
})
export class AccountpageComponent {
  userData!:any;
  userObs!:Observable<any>;

  profileForm!:FormGroup<any>;
  profileStatus!:string;

  // firstName:string = this.userData['f_name'];
  // lastName:string = this.userData['l_name'];
  // address:string = this.userData['address'];
  // permitId:string = this.userData['s_permit_id'];
  // birthday:string = this.userData['birthday'];
  // phone:string = this.userData['phone'];
  // passData!:FormGroup;

  constructor(
    private readonly _user:UsermanagementService,
    private readonly _router:Router,
    private readonly _route:ActivatedRoute
    ){
      
      this.userData = this._route.snapshot.data['userData'];
      let myValue = this.userData.user;
      this.profileStatus = myValue.status;

      this.profileForm = new FormGroup({
        email : new FormControl(myValue.email),
        f_name : new FormControl(myValue.f_name),
        l_name : new FormControl(myValue.l_name),
        phone : new FormControl(myValue.phone)
        // birthday : new FormControl(myValue.birthday),
      })
    }

  async logout(){
    this._user.logout();
    this._router.navigate(['/login/']);
  }

  phoneValidator(c:AbstractControl):{[key:string]:boolean}|null {
    let tempVal:string = c.value;

    if(tempVal.replaceAll(new RegExp("\\D","g"),"").length < 10)
      return {"tooshort":true}

    let expression = RegExp("^\\+?(\\d{2,3} ?)+$");
    if(!expression.test(c.value))
      return {'wrongformat':true}
    
    return null;
  }

  passwordValidator(c:AbstractControl):{[key:string]:boolean}|null {
    let first = c.get("password")?.value;
    let second = c.get("password2")?.value;

    // TODO add password constraints
    if(first.length < 6)
      return {'passwordTooShort':true}

    if(first !== second)
      return {'passwordMismatch': true}
    
    return null;
  }

  updateEmail(){
    this._user.updateUser({
      email : this.profileForm.get('email')?.value,
    });
  }

  updateFName(){
    this._user.updateUser({
      f_name : this.profileForm.get('f_name')?.value,
    });
  }
  updateLName(){
    this._user.updateUser({
      l_name : this.profileForm.get('l_name')?.value,
    });
  }
  // updateBirthday(){
  //   this._user.updateUser({
  //     birthday : this.birthday
  //   });
  // }
  // updateAddress(){
  //   this._user.updateUser({
  //     address : this.address
  //   });
  // }
  updatePhone(){
    this._user.updateUser({
      phone : this.profileForm.get('phone')?.value,
    });
  }
  register(){

  }

}

function permitValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    let expression = RegExp("^[A-Za-z]{2}\\d{7}$");

    if (!expression.test(control.value))
      return { 'invalidPermitFormat': true };
    
    return null;
  };
}

function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    let expression = RegExp("^[\\w\\.\\-]+@[\\w\\.\\-]+\\.\\w{2,4}$");

    if (!expression.test(control.value))
      return { 'invalidemail': true };
    
    return null;
  };
}

function bdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    let expression = RegExp("^(\\d{1,2}[\\.\\/]){2}(\\d{2}|\\d{4})$");

    if (!expression.test(control.value))
      return { 'invalidDate': true };

    return null;
  };
}
