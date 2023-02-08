import { Component } from '@angular/core';
import { AbstractControl, Form, FormControl,FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent {

  public profileForm!:FormGroup<{email:FormControl,permitId:FormControl,b_day:FormControl,lastName:FormControl,firstName:FormControl,phone:FormControl,passData:FormGroup}>;

  constructor(){
    this.profileForm = new FormGroup({
      email: new FormControl('',Validators.compose([
        Validators.email,
        Validators.required
      ])),

      permitId: new FormControl('',Validators.compose([
        this.permitValidator,
        Validators.required
      ])),

      b_day: new FormControl('',Validators.compose([
        this.bdValidator,
        Validators.required
      ])),
      
      lastName: new FormControl('',Validators.required),
      firstName: new FormControl('',Validators.required),
      
      phone:new FormControl('',Validators.compose([
        Validators.required,
        this.phoneValidator
      ])),
      
      passData: new FormGroup({
        password: new FormControl('',Validators.required),
        password2: new FormControl('')
      },{validators:this.passwordValidator})
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
  
  bdValidator(c:AbstractControl):{[key:string]:boolean}|null {
    let expression = RegExp("^(\\d{1,2}[\\.\\/]){2}(\\d{2}|\\d{4})$");

    if (!expression.test(c.value))
      return { 'invalidDate': true };

    return null;
  }

  permitValidator(c:AbstractControl):{[key:string]:boolean}|null {
    let expression = RegExp("^[A-Za-z]{2}\\d{7}$");

    if (!expression.test(c.value))
      return { 'invalidPermitFormat': true };
    
    return null;
  }

  passwordValidator(c:AbstractControl):{[key:string]:boolean}|null {
    let first = c.get("password")?.value;
    let second = c.get("password2")?.value;

    // TODO add password constraints

    if(first !== second)
      return {'passwordMismatch': true}
    
    return null;
  }

  register(){

  }
}
