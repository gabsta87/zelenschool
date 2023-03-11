import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
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
        this.checkBan().then(ban => {
          this.isUserBanned.next(ban);
        })
      }else{
          this.isLoggedAsAdmin.next(false);
          this.isLoggedAsTeacher.next(false);
          this.isLogged.next(false);
          this.isUserBanned.next(false);
      }
    })
  }
  
  isLoggedAsAdmin = new BehaviorSubject(false);
  isLoggedAsTeacher = new BehaviorSubject(false);
  isLogged = new BehaviorSubject(false);
  isUserBanned = new BehaviorSubject(false);
  

  getStatus(){
    if(this.userData && this.userData['status'])
      return this.userData['status'];
    return "visitor";
  }

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

  private async checkBan(){
    let userId = this._auth?.currentUser?.uid;
    if(userId){
      if(this.userData == undefined)
        this.userData = await this._db.getUser(userId);

      console.log("user data : ",this.userData);
      
      console.log("ban : ",this.userData['ban']);
      
      if(this.userData && this.userData['ban'] != undefined){
        return true;
      }
    }
    return false;
  }

  async updateUser(newValue:any){
    this._db.updateUser(newValue);
  }

  getId(){
    return this._auth.currentUser?.uid;
  }

  getUserObs(){
    if(this._auth.currentUser)
      return this._db.getUserObs(this._auth.currentUser?.uid);
    else
      return undefined;
  }

  getUserData(){
    return this.userData;
  }
  
  isBanned():boolean{
    return this.isUserBanned.value;
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
    this.userData = undefined;
    this._auth.signOut();
    this.isLoggedAsAdmin.next(false);
    this.isLoggedAsTeacher.next(false);
    this.isLogged.next(false);
  }
}
