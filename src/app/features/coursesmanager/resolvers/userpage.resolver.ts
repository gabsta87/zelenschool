import { Injectable } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';

interface UserData{
  userObs:Observable<DocumentData|undefined>|undefined,
  user:DocumentData|undefined,
}

@Injectable({
  providedIn: 'root'
})
export class UserpageResolver  {
  constructor(private readonly _usr:UsermanagementService){ }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): UserData {

    let result = {
      userObs : this._usr.getUserObs(),
      user : this._usr.getUserData()
    }

    return result;
  }
}
