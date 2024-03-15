import { Injectable } from '@angular/core';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { DocumentData } from 'firebase/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

@Injectable({
  providedIn: 'root'
})
export class AboutPageResolver  {
  constructor(private readonly _db:AngularfireService){}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<{members:Observable<DocumentData[]>,partners:Observable<DocumentData[]>,activities:Observable<DocumentData[]>}> {

    const result = {
      members : await this._db.getAssoMembers(),
      partners : await this._db.getPartners(),
      activities : await this._db.getActivitiesObs(),
    }

    return result;
  }
}
