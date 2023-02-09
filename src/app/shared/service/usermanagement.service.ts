import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { AngularfireService } from './angularfire.service';

@Injectable({
  providedIn: 'root'
})
export class UsermanagementService {

  constructor(private readonly _db:AngularfireService, private readonly _auth:Auth) {
    
    _auth.onAuthStateChanged(user=>{
      if(user){
        this.isLogged.next(true);
          this.checkStatus("admin").then(newVal=>{
              this.isLoggedAsAdmin.next(newVal);
          })
          this.checkStatus("teacher").then(newVal=>{
              this.isLoggedAsTeacher.next(newVal);
          })
      }else{
          this.isLoggedAsAdmin.next(false);
      }
  })
  }

  isLoggedAsAdmin = new BehaviorSubject(false);
  isLoggedAsTeacher = new BehaviorSubject(false);
  isLogged = new BehaviorSubject(false)

  userData:any = undefined;

  private async checkStatus(requestedStatus:string):Promise<boolean>{
    let userId = this._auth?.currentUser?.uid;

      if(userId){
        
        // ALERT: no dynamic status changing. Need to login to update status
        if(this.userData == undefined)
          this.userData = await this._db.getUser(userId);
        
        if(this.userData && this.userData['status'] == requestedStatus){
          return true;
        }
      }
      return false
  }

  getId(){
    return this._auth.currentUser?.uid;
  }

  getUserData(){
    return this.userData;
  }

  isAdmin():boolean{
    return this.isLoggedAsAdmin.value;
    // return this.checkStatus("admin")
  }

  isTeacher(){
    return this.isLoggedAsTeacher.value;
    // return this.checkStatus("teacher")
  }

  isStudent(){
    return this.isLogged.value;
    // return this.checkStatus("student")
  }

  logout(){
    this.isLoggedAsAdmin.next(false);
    this.isLoggedAsTeacher.next(false);
    this.isLogged.next(false);
  }
}
