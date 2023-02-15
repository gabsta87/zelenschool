import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { Observable, of, switchMap } from 'rxjs';
import { DocumentData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CalendareventsresolveResolver implements Resolve<Observable<Observable<DocumentData[]>>> {

  constructor(private readonly _db:AngularfireService){}
  
  eventsObs!:Observable<DocumentData[]>;
  extractedData!:Observable<DocumentData[]>;

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Observable<DocumentData[]>> {
    this.eventsObs = this._db.getCalendarEntries();
    // this.extractedData  = this.eventsObs.pipe(switchMap(async (e:any) => {
    //   e.forEach(async (elem:any)=>{
    //       elem.author_full = await this._db.getUser(elem.author);

    //       return elem;
    //     }
    //   )
    //   return e;
    //   }));
    // return of(this.extractedData);

    return of(this.eventsObs);
  }
}
