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

    this.eventsObs = this.eventsObs.pipe(
      switchMap(async (calendarEvent: any) => {

        // USERS
        // Récupère les IDs des auteurs de chaque événement
        const authorIds = calendarEvent.map((evt: any) => evt.author);

        // Récupère les infos des utilisateurs correspondants
        const authorInfos = await Promise.all(authorIds.map((id:any) => this._db.getUser(id)));
    
        // Remplace les IDs par les noms des utilisateurs
        calendarEvent.map((evt:any) => evt.author = authorInfos.find((e:any) => e ? e.id === evt.author : undefined))
        
        // ROOMS
        // Récupère les IDs des salles
        const roomIds = calendarEvent.map((evt:any) => evt.room_id);

        // Récupère les infos des salles
        const roomsInfos = await Promise.all(roomIds.map((id:string) => this._db.getRoom(id)));

        // Ajout de la valeur
        calendarEvent.map((evt:any) => evt.room = roomsInfos.find((e:any) => e ? e.id == evt.room_id : undefined ))

        return calendarEvent;
      })
    );

    return of(this.eventsObs);
  }
}
