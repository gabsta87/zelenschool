import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { Observable, of, map, tap, switchMap, forkJoin, firstValueFrom } from 'rxjs';
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

    this.eventsObs = this.eventsObs.pipe(
      switchMap(async (calendarEvent: any) => {

        // Récupère les IDs des auteurs de chaque événement
        const authorIds = calendarEvent.map((evt: any) => evt.author);

        // Récupère les infos des utilisateurs correspondants
        const authorInfos = await Promise.all(authorIds.map((id:any) => this._db.getUser(id)));
    
        // Remplace les IDs par les noms des utilisateurs
        calendarEvent.map((evt:any) => evt.author = authorInfos.find((e:any) => e ? e.id === evt.author : undefined))
    
        return calendarEvent;
      })
    );

    return of(this.eventsObs);
  }
}
