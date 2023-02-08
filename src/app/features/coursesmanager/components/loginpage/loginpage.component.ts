import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, getAuth, GoogleAuthProvider, signInAnonymously, signInWithEmailAndPassword, signInWithPopup } from '@angular/fire/auth';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

@Component({
  selector: 'app-loginpage',
  templateUrl: './loginpage.component.html',
  styleUrls: ['./loginpage.component.scss']
})
export class LoginpageComponent {

  email:string = "";
  password:string = "";

  constructor(
    private readonly _auth: Auth,
    private readonly _dbAccess:AngularfireService,
    private readonly _router: Router
    ) {
  }

  async loginWithGoogle(){
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this._auth,provider);
    this._dbAccess.createUser(credential.user);
    this._router.navigate(['/account/']);
    return credential;
  }

  async loginAnonymously(){
    const credential = await signInAnonymously(this._auth);
    this._dbAccess.createUser(credential.user,"Anonymous");
    return credential;
  }

  async loginWithEmail(){
    const auth = getAuth();
    console.log("email : ",this.email);
    console.log("password : ",this.password);
    
    signInWithEmailAndPassword(auth, this.email, this.password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        this._dbAccess.createUser(user);
        // ...
        this._router.navigate(['/account/']);
        return userCredential;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("error : ",error);
        
      });
  }
}
