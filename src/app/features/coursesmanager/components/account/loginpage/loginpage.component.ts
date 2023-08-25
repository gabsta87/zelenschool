import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, getAuth, GoogleAuthProvider, FacebookAuthProvider ,sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from '@angular/fire/auth';
import { AlertController } from '@ionic/angular';
import { LanguageManagerService } from 'src/app/shared/service/language-manager.service';

@Component({
  selector: 'app-loginpage',
  templateUrl: './loginpage.component.html',
  styleUrls: ['./loginpage.component.scss']
})
export class LoginpageComponent {
  email:string = "";
  password:string = "";
  error:string = "";
  loading!:boolean;

  providerGoogle = new GoogleAuthProvider();
  providerFB = new FacebookAuthProvider();
  auth = getAuth();

  words$ = this._lang.currentLanguage$;

  constructor(
    private readonly _auth: Auth,
    private readonly _router: Router,
    private readonly _alertController: AlertController,
    private readonly _lang : LanguageManagerService,
    ) { }

  async loginWithGoogle(){
    this.loading = true;
    const credential = await signInWithPopup(this._auth,this.providerGoogle)
    .catch(error => {
      this.loading = false;

      // The AuthCredential type that was used.
      const credentialError = GoogleAuthProvider.credentialFromError(error);
      console.log("error while logging in with Google",error.message);
      console.log("credential from error : ",credentialError);

      this.error = error.message
    });

    if(credential == null)
      return;

    this.error = "";
    this.loading = false;
    this._router.navigate(['/about/']);
    return credential;
  }

  async loginWithFB() {
    this.loading = true;
    const credential = await signInWithPopup(this.auth, this.providerFB)
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credentialError = FacebookAuthProvider.credentialFromError(error);
      console.log("error while logging in with FB",error.message);
      console.log("credential from error : ",credentialError);
      
      this.error = error.message;
    });

    if(credential == null)
      return;
      
    this.error = "";
    this.loading = false;
    this._router.navigate(['/about/']);
    return credential;
  }

  async loginWithEmail(){
    if(this.email == ""){
      this.error = "Please enter an email"
      return;
    }

    console.log("cred : ", this.auth, this.email, this.password);
    
    
    this.loading = true;
    const credential = await signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(async (userCredential) => {

        // Signed in 
        const user = userCredential.user;
        // If User doesn't exists, It may have been deleted by an admin -> visitor 
        // this._dbAccess.createUser(user,{email:"",f_name:"",l_name:"",phone:"",status:""});
        this._router.navigate(['/schedule/']);
        this.loading = false;
        this.error = "";
        return userCredential;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        this.error = error.message;
      });
      this.loading = false;
    return credential;
  }

  resetPassword(){
    this.error = "";
    
    if(this.email == "")
      return;

    sendPasswordResetEmail(this._auth, this.email)
    .then(async (result) => {
      const alert = this._alertController.create({
        header: "An email to reset your password was sent to "+this.email,
        buttons: ['OK'],
      });
      (await alert).present();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("Error : ",errorMessage);
      this.error = error.message;
    });
  }
}
