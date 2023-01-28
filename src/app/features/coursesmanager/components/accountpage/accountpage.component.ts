import { Component } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';

@Component({
  selector: 'app-accountpage',
  templateUrl: './accountpage.component.html',
  styleUrls: ['./accountpage.component.scss']
})
export class AccountpageComponent {
  constructor(private readonly _auth:Auth,private readonly _user:UsermanagementService,private readonly _router:Router){}


  // async loadData(){
  //   let userId = this._auth?.currentUser?.uid;
  //   if(userId){
  //     let loadedUser = await this._dbAccess.getUser(userId);

  //     if(!loadedUser || loadedUser['name'] === undefined){
  //       this.userName = "Anonymous"
  //     }else{
  //       this.userName = loadedUser['name'];
  //     }

  //     if(this._auth.currentUser?.email)
  //       this.emailAddress = this._auth.currentUser.email

  //     // this.attendedEvents = await firstValueFrom(this._dbAccess.getEventsAttendedBy(userId));
  //     // this.createdEvents = await firstValueFrom(this._dbAccess.getEventsCreatedBy(userId));
  //   }
  //   this.isLoggedConst.next(this._auth.currentUser);
  //   console.log("user id : ",userId);
    
  // }

  async logout(){
    await signOut(this._auth);
    this._user.logout();
    this._router.navigate(['/login/']);
  }
}
