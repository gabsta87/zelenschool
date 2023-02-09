import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

interface AdminData{
  articles:any[],
  usersObs:Observable<any[]>,
  coursesObs:Observable<any[]>,
}

@Injectable({
  providedIn: 'root'
})
export class AdminpageresolveResolver implements Resolve<AdminData> {

  constructor(private readonly _dbAccess: AngularfireService){}
  
  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<AdminData> {

    let result = {} as AdminData;

    result.usersObs = this._dbAccess.getUsers();
    result.coursesObs = this._dbAccess.getCalendarEntries();
    
    return result;
  }
}
