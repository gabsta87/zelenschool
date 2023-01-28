import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
}
