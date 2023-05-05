import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import dayjs from 'dayjs';
import { BehaviorSubject } from 'rxjs';
import { AngularfireService } from './angularfire.service';
import { getNowDate } from './hour-management.service';

@Injectable({
  providedIn: 'root'
})
export class UsermanagementService{

  isLoggedAsSuperAdmin = new BehaviorSubject(false);
  isLoggedAsAdmin = new BehaviorSubject(false);
  isLoggedAsTeacher = new BehaviorSubject(false);
  isLogged = new BehaviorSubject(false);
  isUserBanned = new BehaviorSubject(false);

  constructor(private readonly _db:AngularfireService, private readonly _auth:Auth) {
    
    _auth.onAuthStateChanged(user=>{
      if(user){
        this.isLogged.next(true);
        this.checkStatus("superadmin").then(newVal=>{
            this.isLoggedAsSuperAdmin.next(newVal);
        })
        this.checkStatus("admin").then(newVal=>{
            this.isLoggedAsAdmin.next(newVal);
        })
        this.checkStatus("teacher").then(newVal=>{
          this.isLoggedAsTeacher.next(newVal);
        })
        this.checkStatus("request").then(newVal=>{
          this.isLoggedAsTeacher.next(newVal);
        })
        this.checkBan().then(ban => {
          this.isUserBanned.next(ban);
        }).then(_ => {
          if(this.isUserBanned.value){
            if(this.userData.ban.comment == "SYSTEM : missed too many courses" && 
              dayjs(this.userData.ban.date).add(1,"month").isBefore(getNowDate())){
                this._db.unbanUser(this.userData.id);
                this.isUserBanned.next(false);
              }
          }
        })
      }else{
          this.isLoggedAsAdmin.next(false);
          this.isLoggedAsTeacher.next(false);
          this.isLogged.next(false);
          this.isUserBanned.next(false);
      }
    })
  }

  getStatus(){
    if(this.userData && this.userData['status'])
      return this.userData['status'];
    return "visitor";
  }

  userData:any = undefined;

  private async checkStatus(requestedStatus:string):Promise<boolean>{
    let userId = this._auth?.currentUser?.uid;

      if(userId){
        
        if(this.userData == undefined){
          this.userData = await this._db.getUser(userId);
        }
        
        if(this.userData && this.userData['status'] && this.userData['status'].includes(requestedStatus)){
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
      
      if(this.userData && this.userData['ban'] != undefined){
        return true;
      }
    }
    return false;
  }

  async updateUser(newValue:any){
    this._db.updateCurrentUser(newValue);
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
    if(this.userData)
      return this.userData
    if(!this.userData && this._auth.currentUser)
        return this._db.getUser(this._auth.currentUser?.uid);
    else
      return undefined
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
