import { Component, ViewChild } from '@angular/core';
import { createUserWithEmailAndPassword, getAuth } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { LanguageManagerService } from 'src/app/shared/service/language-manager.service';
import { bdValidator, emailValidator, passwordValidator, phoneValidator,permitValidator } from 'src/app/shared/service/validators-lib.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent {

  words$ = this._lang.currentLanguage$;

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
  loading = new BehaviorSubject(false);
  errorMessage = "";

  constructor(private readonly _db:AngularfireService,private readonly _router: Router,private readonly _lang:LanguageManagerService){
    this.profileForm = new FormGroup({
      email: new FormControl('',Validators.compose([
        emailValidator(),
        Validators.required
      ])),

      permitId: new FormControl('',Validators.compose([
        permitValidator(),
        // Validators.required
      ])),

      b_day: new FormControl('',Validators.compose([
        bdValidator(),
        Validators.required
      ])),

      address: new FormControl('',Validators.required),
      
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

      teacher:new FormControl<boolean>(false)
    });
  }

  async register(){
    if(!this.profileForm.valid)
      return;

    this.loading.next(true);

    let email = this.profileForm.get('email')?.value;
    let password = this.profileForm.get('passData')?.get("password")?.value;
    
    if(email!=null && password != null){
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        
        // Signed in 
        const user = userCredential.user;

        let tmpFName = this.profileForm.get('firstName')?.value;
        tmpFName = tmpFName ? tmpFName : "";
        let tmpLName = this.profileForm.get('lastName')?.value;
        tmpLName = tmpLName ? tmpLName : "";
        let tmpMail = this.profileForm.get('email')?.value;
        tmpMail = tmpMail ? tmpMail : "";
        let tmpS_permit_id = this.profileForm.get('permitId')?.value;
        tmpS_permit_id = tmpS_permit_id ? tmpS_permit_id : "";
        let tmpBirthday = this.profileForm.get('b_day')?.value;
        tmpBirthday = tmpBirthday ? tmpBirthday : "";
        let tmpPhone = this.profileForm.get('phone')?.value;
        tmpPhone = tmpPhone ? tmpPhone : "";
        let tmpAddress = this.profileForm.get('address')?.value;
        tmpAddress = tmpAddress ? tmpAddress : "";
        let tmpStatus = "student";

        await this._db.createUser(user,{
          f_name : tmpFName, 
          l_name : tmpLName, 
          email : tmpMail, 
          s_permit_number : tmpS_permit_id, 
          phone : tmpPhone, 
          address : tmpAddress,
          status : tmpStatus,
          birthday : tmpBirthday,
        });


        this._router.navigate(['/schedule/']);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("error : ",error);
        this.errorMessage = error.message;
        
        // ..
      });
    }
    else{
      console.log("Error: wrong email/password");
      console.log("email : ",email);
      console.log("password : ",password);
      
    }
    this.loading.next(false);
  }

  return(){
    this.errorMessage = "";
    this._router.navigate(['/login/']);
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
    this.profileForm.get("b_day")?.setValue(truncatedValue);
  }
}