import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { DocumentData } from "firebase/firestore";
import { firstValueFrom } from "rxjs";
import { AngularfireService } from "src/app/shared/service/angularfire.service";

@Injectable({
  providedIn: 'root',
})
export class assoEventsSnapshotResolver{
  
  constructor(private readonly _db:AngularfireService){}
  
  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<DocumentData[]> {
    let assoCenters = await firstValueFrom(await this._db.getAssoEvents());
    
    return assoCenters;
  }
};