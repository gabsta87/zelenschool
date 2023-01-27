import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

interface AdminData{
  articles:any[],
  // courses:{author:string,attendantsId:string[],eventDate:string,maxParticipants:number,roomId:number}[],
  courses:any[],
  users:any[],
}

@Injectable({
  providedIn: 'root'
})
export class AdminpageresolveResolver implements Resolve<AdminData> {

  constructor(private readonly _dbAccess: AngularfireService){}
  
  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<AdminData> {

    let result = {} as AdminData;

    result.courses = await firstValueFrom(this._dbAccess.getCalendarEntries());
    result.users = await firstValueFrom(this._dbAccess.getUsers());
    
    return result;
  }
}
