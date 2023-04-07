import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

@Injectable({
  providedIn: 'root'
})
export class AboutPageResolver implements Resolve<any> {
  constructor(private readonly _db:AngularfireService){}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {

    const result = {
      members : await firstValueFrom(this._db.getAssoMembers()),
      partners : await firstValueFrom(this._db.getPartners()),
    }

    return result;
  }
}
