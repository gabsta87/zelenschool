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
      console.log("user : ",user);
      
      if(user){
        this.isLogged.next(true);
          this.checkStatus("admin").then(newVal=>{
              this.isLoggedAsAdmin.next(newVal);
          })
      }else{
          this.isLoggedAsAdmin.next(false);
      }
  })
  }

  isLoggedAsAdmin = new BehaviorSubject(false);
  // isLoggedAsAdmin = new BehaviorSubject<boolean|undefined>(false);
  isLogged = new BehaviorSubject(false)

  private async checkStatus(requestedStatus:string):Promise<boolean>{
    let userId = this._auth?.currentUser?.uid;

      if(userId){
        let userData = await this._db.getUser(userId);
        if(userData && userData['status'] == requestedStatus){
          return true;
        }
      }
      return false
  }

  async isAdmin(){
    return this.checkStatus("admin")
  }

  async isTeacher(){
    return this.checkStatus("teacher")
  }

  async isStudent(){
    return this.checkStatus("student")
  }

  logout(){
    this.isLoggedAsAdmin.next(false);
    this.isLogged.next(false);
  }
}
