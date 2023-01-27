import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Auth } from 'firebase/auth';
import { firstValueFrom, Observable, of } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

interface AdminData{
  articles:any[],
  courses:any[],
  users:any[],
}

@Injectable({
  providedIn: 'root'
})
export class AdminpageresolveResolver implements Resolve<AdminData> {

  constructor(private readonly _auth:Auth,private readonly _dbAccess: AngularfireService){}
  
  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<AdminData> {

    let result = {} as AdminData;


    result.courses = await firstValueFrom(this._dbAccess.getCalendarEntries());
    result.users = await firstValueFrom(this._dbAccess.getUsers());
    
    return result;
  }
}
