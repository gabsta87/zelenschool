import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, getAuth, GoogleAuthProvider, FacebookAuthProvider ,sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from '@angular/fire/auth';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { AlertController, ModalController } from '@ionic/angular';
import { ChoiceModalComponent } from '../choice-modal/choice-modal.component';
import { LanguageManagerService } from 'src/app/shared/service/language-manager.service';
import { CompleteAccountModalComponent } from '../complete-account-modal/complete-account-modal.component';

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
    private readonly _dbAccess:AngularfireService,
    private readonly _router: Router,
    private readonly _modalCtrl: ModalController,
    private readonly _alertController: AlertController,
    private readonly _lang : LanguageManagerService,
    ) {
      
  }

  async loginWithGoogle(){
    this.loading = true;
    const credential = await signInWithPopup(this._auth,this.providerGoogle)
    .catch(error => {
      this.error = error.message
      this.loading = false;
    });

    if(credential == null)
      return;

    this.loading = false;
    return credential;
  }

  private async completeUserInscription(credential:any){

    console.log("credential : ",credential);
    
    // TODO 
    const accountData = await this._modalCtrl.create({component:CompleteAccountModalComponent,backdropDismiss:false, canDismiss:false});
    accountData.present();
    const {data, role} = await accountData.onWillDismiss();


    const createdUser = await this._dbAccess.createUser(credential.user,{email:"",f_name:"",l_name:"",phone:"",status:""});

    // User is new, and an entry was added to the database
    if(createdUser != undefined){
      this.error = "";
      console.log("created user : ",createdUser);
      console.log("credential : ",credential);

      this._dbAccess.banUser(createdUser.id,"Waiting for user to complete profile informations");

      const choiceModal = await this._modalCtrl.create({
        component : ChoiceModalComponent
      });
      choiceModal.present();
      const {data, role} = await choiceModal.onWillDismiss();
      if(role === "student"){
        this._dbAccess.updateCurrentUser({status:"student"})
        this._router.navigate(['/account/']);
      }else if(role === "teacher"){
        this._dbAccess.updateCurrentUser({status:"teacher"})
        this._router.navigate(['/accountTeacher/']);
      }
    }else{
      this._router.navigate(['/about/']);
    }
  }

  async loginWithFB() {
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
    return credential;
  }

  async loginWithEmail(){
    if(this.email == ""){
      this.error = "Please enter an email"
      return;
    }
    
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
    });
  }
}
