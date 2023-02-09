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
  userData = this._route.snapshot.data['userData'];
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
    this.loadData()
  }

  ionViewWillEnter(){
    this.loadData();
  }

  loadData(){
    let myValue = this.userData.user;
    this.profileStatus = this._user.getStatus();

    console.log("status : ",this.profileStatus);

    this.profileForm = new FormGroup({
      email : new FormControl(myValue.email,emailValidator()),
      f_name : new FormControl(myValue.f_name,Validators.required),
      l_name : new FormControl(myValue.l_name,Validators.required),
      phone : new FormControl(myValue.phone,phoneValidator())
    })

    switch(this.profileStatus){
      case "teacher":
        this.profileForm.addControl("experience" , new FormControl(myValue.experience));
        this.profileForm.addControl("students_age", new FormControl(myValue.students_age));
        break;
      case "student":
        this.profileForm.addControl("address" , new FormControl(myValue.address));
        this.profileForm.addControl("s_permit_number" , new FormControl(myValue.s_permit_id));
        this.profileForm.addControl("birthday" , new FormControl(myValue.birthday));
        break;
    }
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
    };

    switch(this.profileStatus){
      case "teacher":
        (updateItem as any).experience = this.profileForm.get('experience')?.value;
        (updateItem as any).students_age = this.profileForm.get('students_age')?.value;
        break;
        case "student":
        (updateItem as any).address = this.profileForm.get('address')?.value;
        (updateItem as any).s_permit_id = this.profileForm.get('s_permit_number')?.value;
        (updateItem as any).birthday = this.profileForm.get('birthday')?.value;
        break;
    }
    this._user.updateUser(updateItem);
  }

  cancel(){

  }

}

function phoneValidator(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {

    let tempVal:string = c.value;

    if(tempVal.replaceAll(new RegExp("\\D","g"),"").length < 10)
      return {"tooshort":true}

    let expression = RegExp("^\\+?(\\d{2,3} ?)+$");
    if(!expression.test(c.value))
      return {'wrongformat':true}
    
    return null;
  };
}
function passwordValidator(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    let first = c.get("password")?.value;
    let second = c.get("password2")?.value;

    // TODO add password constraints
    if(first.length < 6)
      return {'passwordTooShort':true}

    if(first !== second)
      return {'passwordMismatch': true}
    
    return null;
  };
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
