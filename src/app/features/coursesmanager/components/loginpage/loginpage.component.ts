import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// import { Auth, GoogleAuthProvider, signInAnonymously, signInWithPopup } from 'firebase/auth';
import { Auth, createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, linkWithCredential, signInAnonymously, signInWithEmailAndPassword, signInWithPopup, signOut, user } from '@angular/fire/auth';

import { BehaviorSubject } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

@Component({
  selector: 'app-loginpage',
  templateUrl: './loginpage.component.html',
  styleUrls: ['./loginpage.component.scss']
})
export class LoginpageComponent {
  constructor(
    private readonly _auth: Auth,
    private readonly _dbAccess:AngularfireService,
    private readonly _route: ActivatedRoute
    ) {
  }  
  userName!:string;
  emailAddress!:string;
  password!:string;
  
  isLoggedConst = new BehaviorSubject(this._auth.currentUser)

  // ionViewWillEnter(): void {
  //   this.accountData = this._route.snapshot.data['accountData'];

  //   this.userName = this.accountData.userPseudo;
  //   this.emailAddress = this.accountData.userEmail;
  //   this.attendedEvents = this.accountData.attendingEvents;
  //   this.createdEvents = this.accountData.createdEvents;
  // }

  async loadData(){
    let userId = this._auth?.currentUser?.uid;
    if(userId){
      let loadedUser = await this._dbAccess.getUser(userId);

      if(!loadedUser || loadedUser['name'] === undefined){
        this.userName = "Anonymous"
      }else{
        this.userName = loadedUser['name'];
      }

      if(this._auth.currentUser?.email)
        this.emailAddress = this._auth.currentUser.email

      // this.attendedEvents = await firstValueFrom(this._dbAccess.getEventsAttendedBy(userId));
      // this.createdEvents = await firstValueFrom(this._dbAccess.getEventsCreatedBy(userId));
    }
    this.isLoggedConst.next(this._auth.currentUser);
    console.log("user id : ",userId);
    
  }

  async loginWithGoogle(){
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this._auth,provider);
    this._dbAccess.createUser(credential.user);
    this.loadData();
    return credential;
  }

  async loginAnonymously(){
    const credential = await signInAnonymously(this._auth);
    this._dbAccess.createUser(credential.user,"Anonymous");
    this.loadData();
    return credential;
  }
}
