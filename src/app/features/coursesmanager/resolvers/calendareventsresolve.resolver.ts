import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { first, firstValueFrom, Observable, of, switchMap } from 'rxjs';
import { DocumentData } from '@angular/fire/firestore';
import * as dayjs from 'dayjs';

@Injectable({
  providedIn: 'root'
})
export class CalendareventsresolveResolver implements Resolve<Observable<Observable<DocumentData[]>>> {

  constructor(private readonly _db:AngularfireService){}
  
  eventsObs!:Observable<DocumentData[]>;
  extractedData!:Observable<DocumentData[]>;

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Observable<DocumentData[]>> {
    this.eventsObs = this._db.getCalendarEntries();
    console.log("events ",this.eventsObs);
    
    this.extractedData  = this.eventsObs.pipe(switchMap(async (e:any) => {
      e.forEach(async (elem:any)=>
        {
          console.log("elem ",elem);
          
          elem.author = await this._db.getUser(elem.author);
          
          elem.eventDate = dayjs(elem.eventDate);

          if(elem.attendantsId){
            elem.attendantsId.forEach(async (attendant:any,index:number) => {
              elem.attendantsId[index] = await this._db.getUser(attendant);
            })
          }
          return elem;
        }
      )
      return e;
      }));
    return of(this.extractedData);
  }
}
