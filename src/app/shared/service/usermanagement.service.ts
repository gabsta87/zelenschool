import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import dayjs from 'dayjs';
import { BehaviorSubject, Observable, firstValueFrom, of } from 'rxjs';
import { AngularfireService, UserInfos } from './angularfire.service';
import { getNowDate } from './hour-management.service';
import { LanguageManagerService } from './language-manager.service';

@Injectable({
  providedIn: 'root'
})
export class UsermanagementService{

  isLoggedAsSuperAdmin = new BehaviorSubject(false);
  isLoggedAsAdmin = new BehaviorSubject(false);
  isLoggedAsTeacher = new BehaviorSubject(false);
  isLogged = new BehaviorSubject(false);
  isUserBanned = new BehaviorSubject(false);
  isParent = new BehaviorSubject(false);

  constructor(private readonly _db:AngularfireService, private readonly _auth:Auth, private readonly _lang : LanguageManagerService) {
    
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
        this.checkChildren().then(parent => this.isParent.next(parent))

      }else{
          this.isLoggedAsAdmin.next(false);
          this.isLoggedAsTeacher.next(false);
          this.isLogged.next(false);
          this.isUserBanned.next(false);
      }
      _lang.loadUserLanguage();
    })
  }

  userData:any = undefined;
  userObs!:Observable<any>;

  private async checkStatus(requestedStatus:string):Promise<boolean>{
    let userId = this._auth?.currentUser?.uid;

      if(userId){
        
        if(this.userData == undefined){
          this.userData = await this._db.getUser(userId);
        }

        if(this.userObs == undefined){
          this.userObs = await this._db.getUserObs(userId);
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

  private async checkChildren(){
    let userId = this._auth?.currentUser?.uid;
    if(userId){
      if(this.userData == undefined)
        this.userData = await this._db.getUser(userId);
      
      if(this.userData && this.userData['children'] != undefined && this.userData['children'].length > 0){
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

  setLanguage(lang:string){
    this._db.updateCurrentUser({"language":lang});
  }

  async addChild(data:UserInfos){
    let result = await this._db.createChild({...data,status:"child",parent:this._auth.currentUser?.uid});
    let newId = result.path.split("/")[1];
    
    let actualValue = await firstValueFrom(this.userObs)
    let actualChildren = actualValue.children;
      
    this.updateUser({children:[...actualChildren,newId]})
  }

  async deleteChild(id:string){
    
    let actualValue = await firstValueFrom(this.userObs)
    let actualChildren = actualValue.children;

    let childrenIndex = actualChildren.indexOf(id);
    
    actualChildren.splice(childrenIndex,1);
    
    this._db.updateCurrentUser({children:actualChildren})
    this._db.removeUser(id);
  }

  logout(){
    this.userData = undefined;
    this.userObs = undefined as any;
    this._auth.signOut();
    this.isLoggedAsAdmin.next(false);
    this.isLoggedAsTeacher.next(false);
    this.isLogged.next(false);
  }
}
