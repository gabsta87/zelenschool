import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendareventsresolveResolver implements Resolve<boolean> {

  constructor(_dbAccess:AngularfireService){

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {


   this.eventsObs = this._dbAccess.getCalendarEntries();
   console.log("fetched events : ",this.eventsObs);
    return of(true);
  }
}
