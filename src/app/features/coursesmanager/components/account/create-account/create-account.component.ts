import { Component } from '@angular/core';
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
    this.loading.next(true);

    let email = this.profileForm.get('email')?.value;
    let password = this.profileForm.get('passData')?.get("password")?.value;
    
    if(email!=null && password != null){
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        
        // Signed in 
        const user = userCredential.user;
        
        await this._db.createUser(user);

        let tmpFName = this.profileForm.get('firstName')?.value;
        let tmpLName = this.profileForm.get('lastName')?.value;
        let tmpMail = this.profileForm.get('email')?.value;

        if(tmpFName && tmpLName && tmpMail){

          this._db.updateCurrentUser({
            f_name : tmpFName,
            l_name : tmpLName,
            email : tmpMail,
            status:"student",
            s_permit_id : this.profileForm.get('permitId')?.value,
            birthday : this.profileForm.get('b_day')?.value,
            phone : this.profileForm.get('phone')?.value,
            address : this.profileForm.get('address')?.value,
          });
          
          this._router.navigate(['/schedule/']);
        }
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
}