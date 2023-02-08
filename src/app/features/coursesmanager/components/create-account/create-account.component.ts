import { Component } from '@angular/core';
import { AbstractControl, Form, FormControl,FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { createUserWithEmailAndPassword, getAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent {

  profileForm!:FormGroup<{
    email:FormControl<string|null>,
    permitId:FormControl<string|null>,
    b_day:FormControl<string|null>,
    address:FormControl<string|null>,
    lastName:FormControl<string|null>,
    firstName:FormControl<string|null>,
    phone:FormControl<string|null>,
    passData:FormGroup,
    teacher:FormControl
  }>;

  isTeacher = new BehaviorSubject(false);
  errorMessage = "";

    constructor(private readonly _db:AngularfireService,private readonly _router: Router){

    this.profileForm = new FormGroup({
      email: new FormControl('',Validators.compose([
        emailValidator(),
        Validators.required
      ])),

      permitId: new FormControl('',Validators.compose([
        permitValidator(this.isTeacher.value),
        Validators.required
      ])),

      b_day: new FormControl('',Validators.compose([
        bdValidator(this.isTeacher.value),
        Validators.required
      ])),

      address: new FormControl('',Validators.required),
      
      lastName: new FormControl('',Validators.required),
      firstName: new FormControl('',Validators.required),
      
      phone:new FormControl('',Validators.compose([
        Validators.required,
        this.phoneValidator
      ])),
      
      passData: new FormGroup({
        password: new FormControl('',Validators.required),
        password2: new FormControl('')
      },{validators:this.passwordValidator}),

      teacher:new FormControl<boolean>(false)
    });
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

  updateStatus($event:any){
    this.isTeacher.next($event.target.checked);
  }

  register(){

    const auth = getAuth();
    let email = this.profileForm.get('email')?.value;
    let password = this.profileForm.get('passData')?.get("password")?.value;
    
    if(email!=null && password != null){
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // ...
        console.log("current user : ",auth.currentUser);
        console.log("credential : ", user);
        
        this._db.createUser(user);
        console.log(user);

        this._db.setUser({
          f_name : this.profileForm.get('firstName')?.value,
          l_name : this.profileForm.get('lastName')?.value,
          email : this.profileForm.get('email')?.value,
          s_permit_id : this.profileForm.get('permitId')?.value,
          birthday : this.profileForm.get('b_day')?.value,
          phone : this.profileForm.get('phone')?.value,
          address : this.profileForm.get('address')?.value,
        });
        
        // ...
        this._router.navigate(['/account/']);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("error : ",error);
        
        // ..
      });
    }
    else{
      console.log("Error: wrong email/password");
      console.log("email : ",email);
      console.log("password : ",password);
      
    }
  }
}

function permitValidator(isTeacher: boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if(isTeacher)
      return null;

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

function bdValidator(isTeacher: boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if(isTeacher)
      return null;

    let expression = RegExp("^(\\d{1,2}[\\.\\/]){2}(\\d{2}|\\d{4})$");

    if (!expression.test(control.value))
      return { 'invalidDate': true };

    return null;
  };
}