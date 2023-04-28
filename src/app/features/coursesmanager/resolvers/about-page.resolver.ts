import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { DocumentData } from 'firebase/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

@Injectable({
  providedIn: 'root'
})
export class AboutPageResolver implements Resolve<{members:DocumentData[],partners:DocumentData[],activities:Observable<DocumentData[]>}> {
  constructor(private readonly _db:AngularfireService){}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<{members:DocumentData[],partners:DocumentData[],activities:Observable<DocumentData[]>}> {

    const result = {
      members : await firstValueFrom(this._db.getAssoMembers()),
      partners : await firstValueFrom(this._db.getPartners()),
      activities : await this._db.getActivitiesObs(),
    }

    return result;
  }
}
