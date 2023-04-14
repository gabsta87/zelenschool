import { Component } from '@angular/core';
import { createUserWithEmailAndPassword, getAuth } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { emailValidator, passwordValidator, phoneValidator } from 'src/app/shared/service/validators-lib.service';

@Component({
  selector: 'app-create-account-teacher',
  templateUrl: './create-account-teacher.component.html',
  styleUrls: ['./create-account-teacher.component.scss']
})
export class CreateAccountTeacherComponent {

  profileForm!:FormGroup<{
    email:FormControl<string|null>,
    lastName:FormControl<string|null>,
    firstName:FormControl<string|null>,
    phone:FormControl<string|null>,
    passData:FormGroup,
  }>;

  errorMessage = "";

  constructor(private readonly _db:AngularfireService,private readonly _router: Router){

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

    const auth = getAuth();
    let email = this.profileForm.get('email')?.value;
    let password = this.profileForm.get('passData')?.get("password")?.value;
    
    if(email!=null && password != null){
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        
        this._db.createUser(user);

        let tmpFName = this.profileForm.get('firstName')?.value;
        let tmpLName = this.profileForm.get('lastName')?.value;
        let tmpMail = this.profileForm.get('email')?.value;

        if(tmpFName && tmpLName && tmpMail){
          this._db.setUser({
            f_name : tmpFName,
            l_name : tmpLName,
            email : tmpMail,
            phone : this.profileForm.get('phone')?.value,
            status : "request"
          });
          this._router.navigate(['/accountTeacher/']);
        }
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
      console.log("password : ",password);
      
    }
  }

  return(){
    this.errorMessage = "";
    this._router.navigate(['/login/']);
  }
}
