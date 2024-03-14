import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { DocumentData } from "firebase/firestore";
import { Observable } from "rxjs";
import { AngularfireService } from "src/app/shared/service/angularfire.service";

@Injectable({
  providedIn: 'root',
})
export class assoEventsResolver{
  
  constructor(private readonly _db:AngularfireService){}
  
  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Observable<DocumentData[]>> {
    let assoCenters = await this._db.getAssoEvents();
    
    return assoCenters;
  }
};