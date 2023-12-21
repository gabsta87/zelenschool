import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import dayjs from 'dayjs';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { AngularfireService, UserInfos } from './angularfire.service';
import { getNowDate } from './hour-management.service';
import { LanguageManagerService } from './language-manager.service';
import { CompleteAccountModalComponent } from 'src/app/features/coursesmanager/components/account/complete-account-modal/complete-account-modal.component';
import { ModalController } from '@ionic/angular';
import { browserSessionPersistence, setPersistence } from 'firebase/auth';

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
    
  constructor(
    private readonly _db:AngularfireService, 
    private readonly _auth:Auth, 
    private readonly _lang : LanguageManagerService, 
    private readonly _modalCtrl: ModalController) {
    
    _auth.onAuthStateChanged(async user=>{
      if(user){

        // TODO Find a way to way better delay. In case of bad connection, this delay may not be enough
        setTimeout(async () => {
          
          this.isLogged.next(true);
          
          const isDataComplete = await this.isDataComplete();

          if(!isDataComplete){
            const accountData = await this._modalCtrl.create({component:CompleteAccountModalComponent,
              componentProps: { 
                userData: this.userData
              },
              backdropDismiss:false});
            accountData.present();
            const {data, role} = await accountData.onWillDismiss();
            this._db.updateCurrentUser(data);
            this.userData = undefined;
          }
        }, 1000);


        this.checkStatus("superadmin").then(newVal=>{
            this.isLoggedAsSuperAdmin.next(newVal);
        })
        this.checkStatus("admin").then(newVal=>{
            this.isLoggedAsAdmin.next(newVal);
        })
        this.checkStatus("teacher").then(newVal=>{
          this.isLoggedAsTeacher.next(newVal);
        })
        this.checkBan().then(ban => {
          this.isUserBanned.next(ban);
          if(ban) this.isBanFinished(this.userData)
        })
        
        this.isParent.next(await this.checkChildren())

        if(this.isParent.value){
          this.userData['children'].forEach(async (child:string) => this.isBanFinished(await this._db.getUser(child)));
        }

      }else{
          this.isLoggedAsAdmin.next(false);
          this.isLoggedAsTeacher.next(false);
          this.isLogged.next(false);
          this.isUserBanned.next(false);
      }
      _lang.loadUserLanguage();
    })

    this.isLogged.asObservable()

    setPersistence(_auth, browserSessionPersistence)

  }

  private isBanFinished(user:any){
    if(!user.ban)
      return true;

    if(user.ban.comment == "SYSTEM : missed too many courses" && 
        dayjs(user.ban.date).add(1,"month").isBefore(getNowDate())){
      this._db.unbanUser(user.id);
      return true
    }
    return false;
  }

  userData:any = undefined;
  userObs!:Observable<any>;

  private async isDataComplete():Promise<boolean>{
    let userId = this._auth?.currentUser?.uid;
    
    if(userId){
      if(this.userData == undefined){
        this.userData = await this._db.getUser(userId);
      }

      if(this.userData && this.userData['status'] && this.userData['email'] && this.userData['f_name'] && this.userData['l_name']){
        return true;
      }else{
        return false;
      }

    }else {
      return false;
    }
  }

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
    let actualChildren = actualValue.children ? actualValue.children : [];
      
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
