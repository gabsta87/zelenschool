import { Component } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { DocumentData } from '@angular/fire/firestore';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';

@Component({
  selector: 'app-accountpage',
  templateUrl: './accountpage.component.html',
  styleUrls: ['./accountpage.component.scss']
})
export class AccountpageComponent {
  userData!:DocumentData;

  firstName!:string;
  lastName!:string;
  email!:string;
  address!:string;
  permitId!:string;
  birthday!:string;
  phone!:string;
  passData!:FormGroup;
  // firstName!:FormControl;
  // lastName!:FormControl;
  // emailGroup!:FormGroup;
  // address!:FormControl;
  // permitId!:FormControl;
  // birthday!:FormControl;
  // phone!:FormControl;
  // passData!:FormGroup;

  constructor(
    private readonly _auth:Auth,
    private readonly _user:UsermanagementService,
    private readonly _router:Router,
    private readonly _route:ActivatedRoute){  }

  ionViewWillEnter(){
    this.userData = this._route.snapshot.data['userData'];
    console.log("user Data : ",this.userData);
    this.email = this.userData['email'];
    console.log("email : ",this.email);
    
    // this.emailGroup = new FormGroup({
    //   email : new FormControl(this.userData['email'], emailValidator() )
    // });

    // this.permitId = new FormControl(this.userData['s_permit_id'], permitValidator());

    // this.birthday = new FormControl(this.userData['birthday'], bdValidator() );

    // this.address = new FormControl(this.userData['address']);
    
    // this.lastName = new FormControl(this.userData['lastName']);
    // this.firstName = new FormControl(this.userData['firstName']);
    
    // this.phone = new FormControl(this.userData['phone'], this.phoneValidator );
    
    // this.passData = new FormGroup({
    //   password: new FormControl(''),
    //   password2: new FormControl('')
    // },{validators:this.passwordValidator});
    
  }

  async logout(){
    await signOut(this._auth);
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

    // let email = this.profileForm.get('email')?.value;
    // let password = this.profileForm.get('passData')?.get("password")?.value;
    
    // // Signed in 
    // const user = userCredential.user;
   
    // console.log(user);

    // this._db.setUser({
    //   f_name : this.profileForm.get('firstName')?.value,
    //   l_name : this.profileForm.get('lastName')?.value,
    //   email : this.profileForm.get('email')?.value,
    //   s_permit_id : this.profileForm.get('permitId')?.value,
    //   birthday : this.profileForm.get('b_day')?.value,
    //   phone : this.profileForm.get('phone')?.value,
    //   address : this.profileForm.get('address')?.value,
    // });
      
  }

  updatePassword(){

    // TODO prompt to ask for previous password
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
