import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DocumentData } from 'firebase/firestore';
import { Observable, map, of } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

export class centersResolver{
  
  constructor(private readonly _db:AngularfireService){}
  
  assoCenters!:Observable<DocumentData[]>;

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Observable<DocumentData[]>> {
    this.assoCenters = await this._db.getAssoCenters();
    return this.assoCenters;
  }
};
