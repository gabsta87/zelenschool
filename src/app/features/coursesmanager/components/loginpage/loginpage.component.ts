import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, getAuth, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from '@angular/fire/auth';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { AlertController, ModalController } from '@ionic/angular';
import { ChoiceModalComponent } from '../choice-modal/choice-modal.component';

@Component({
  selector: 'app-loginpage',
  templateUrl: './loginpage.component.html',
  styleUrls: ['./loginpage.component.scss']
})
export class LoginpageComponent {

  email:string = "";
  password:string = "";
  error:string = "";

  constructor(
    private readonly _auth: Auth,
    private readonly _dbAccess:AngularfireService,
    private readonly _router: Router,
    private readonly _modalCtrl: ModalController,
    private readonly _alertController: AlertController,
    ) {
  }

  async loginWithGoogle(){
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this._auth,provider);
    const createdUser = await this._dbAccess.createUser(credential.user);

    // User is new, and an entry was added to the database
    if(createdUser != undefined){
      this._dbAccess.banUser(credential.user.uid,"Waiting for user to complete profile informations");

      const choiceModal = await this._modalCtrl.create({
        component : ChoiceModalComponent
      });
      choiceModal.present();
      const {data, role} = await choiceModal.onWillDismiss();
      if(role === "student"){
        this._dbAccess.updateUser({status:"student"})
        this._router.navigate(['/account/']);
      }else if(role === "teacher"){
        this._dbAccess.updateUser({status:"teacher"})
        this._router.navigate(['/accountTeacher/']);
      }
    }else{
      this._router.navigate(['/about/']);
    }
    return credential;
  }

  async loginWithEmail(){
    if(this.email == ""){
      this.error = "Please enter an email"
      return;
    }

    const auth = getAuth();
    
    const credential = await signInWithEmailAndPassword(auth, this.email, this.password)
      .then(async (userCredential) => {
        // Signed in 
        const user = userCredential.user;
        this._dbAccess.createUser(user);
        this._router.navigate(['/schedule/']);
        return userCredential;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        this.error = error.message;
      });
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
