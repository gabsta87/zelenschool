import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Auth } from 'firebase/auth';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

@Injectable({
  providedIn: 'root'
})
export class TeacherpageGuard implements CanActivate {
  constructor(private readonly _auth:Auth, private readonly _db:AngularfireService){}
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<any> {

      let userId = this._auth?.currentUser?.uid;

      if(userId){
        let userData = await this._db.getUser(userId);

        if(userData)
          return userData['status'] == "teacher";
      }

      return false
  }
}
