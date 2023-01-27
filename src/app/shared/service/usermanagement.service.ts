import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { AngularfireService } from './angularfire.service';

@Injectable({
  providedIn: 'root'
})
export class UsermanagementService {

  constructor(private readonly _db:AngularfireService, private readonly _auth:Auth) { }

  private async checkStatus(requestedStatus:string){
    let userId = this._auth?.currentUser?.uid;

      if(userId){
        let userData = await this._db.getUser(userId);

        if(userData)
          return userData['status'] == requestedStatus;
      }

      return false
  }

  isAdmin(){
    return this.checkStatus("admin")
  }

  isTeacher(){
    return this.checkStatus("teacher")
  }

  isStudent(){
    return this.checkStatus("student")
  }
}
