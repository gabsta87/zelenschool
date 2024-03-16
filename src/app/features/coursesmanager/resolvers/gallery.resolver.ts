import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DocumentData } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

@Injectable({
  providedIn: 'root',
})
export class GalleryResolver{
  
  constructor(private readonly _db:AngularfireService){}
  
  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Observable<DocumentData[]>> {
    return this._db.getGalleries();
  }
};
