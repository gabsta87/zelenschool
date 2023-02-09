import { Injectable } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';

@Injectable({
  providedIn: 'root'
})
export class UserpageResolver implements Resolve<DocumentData> {
  constructor(private readonly _usr:UsermanagementService){

  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): DocumentData {
    return this._usr.getUserData();
  }
}
