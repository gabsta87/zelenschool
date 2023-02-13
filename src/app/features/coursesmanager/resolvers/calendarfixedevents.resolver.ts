import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { Observable, of, switchMap } from 'rxjs';
import { DocumentData } from '@angular/fire/firestore';
import * as dayjs from 'dayjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarfixedeventsResolver implements Resolve<DocumentData[]> {
  
  constructor(private readonly _db:AngularfireService){}
  
  eventsObs!:Observable<DocumentData[]>;
  extractedData!:any;

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): DocumentData[]{
    this.eventsObs = this._db.getCalendarEntries();
    this.extractedData  = this.eventsObs.pipe(switchMap(async (e:any) => {
      
      e.forEach(async (elem:any)=>
        {
          elem.author_full = await this._db.getUser(elem.author);
          
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
      
    return this.extractedData;
  }
}
