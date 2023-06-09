import { Component, ViewChild } from '@angular/core';
import { createUserWithEmailAndPassword, getAuth } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { LanguageManagerService } from 'src/app/shared/service/language-manager.service';
import { emailValidator, passwordValidator, phoneValidator } from 'src/app/shared/service/validators-lib.service';

@Component({
  selector: 'app-create-account-teacher',
  templateUrl: './create-account-teacher.component.html',
  styleUrls: ['./create-account-teacher.component.scss']
})
export class CreateAccountTeacherComponent {

  @ViewChild('popover') popover : any;

  profileForm!:FormGroup<{
    email:FormControl<string|null>,
    lastName:FormControl<string|null>,
    firstName:FormControl<string|null>,
    phone:FormControl<string|null>,
    passData:FormGroup,
  }>;

  words$ = this._lang.currentLanguage$;

  errorMessage = "";
  isOpen = false;

  constructor(private readonly _db:AngularfireService,private readonly _router: Router, private readonly _lang:LanguageManagerService){

    this.profileForm = new FormGroup({
      email: new FormControl('',Validators.compose([
        emailValidator(),
        Validators.required
      ])),

      lastName: new FormControl('',Validators.required),
      firstName: new FormControl('',Validators.required),
      
      phone:new FormControl('',Validators.compose([
        Validators.required,
        phoneValidator()
      ])),
      
      passData: new FormGroup({
        password: new FormControl('',Validators.required),
        password2: new FormControl('')
      },{validators:passwordValidator()}),
    });
  }

  register(){
    if(!this.profileForm.valid)
      return

    const auth = getAuth();
    let email = this.profileForm.get('email')?.value;
    let password = this.profileForm.get('passData')?.get("password")?.value;
    
    if(email!=null && password != null){
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in 
        const user = userCredential.user;
        
        let tmpFName = this.profileForm.get('firstName')?.value;
        tmpFName = tmpFName ? tmpFName : "";
        let tmpLName = this.profileForm.get('lastName')?.value;
        tmpLName = tmpLName ? tmpLName : "";
        let tmpMail = this.profileForm.get('email')?.value;
        tmpMail = tmpMail ? tmpMail : "";
        let tmpPhone = this.profileForm.get('phone')?.value;
        tmpPhone = tmpPhone ? tmpPhone : "";
        let tmpStatus = "request";

        await this._db.createUser(user,{
          email : tmpMail,
          f_name : tmpFName,
          l_name : tmpLName, 
          phone : tmpPhone, 
          status : tmpStatus});

        this.presentPopover();
        // TODO popup to confirm request
        this._router.navigate(['/about/']);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("error : ",error);
      });
    }
    else{
      console.log("Error: wrong email/password");
      console.log("email : ",email);
      
    }
  }

  presentPopover() {
    this.isOpen = true;
  }

  return(){
    this.errorMessage = "";
    this._router.navigate(['/login/']);
  }
}
