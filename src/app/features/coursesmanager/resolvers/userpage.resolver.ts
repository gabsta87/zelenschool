import { Injectable } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, firstValueFrom, switchMap } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';

interface UserData{
  userObs:Observable<DocumentData|undefined>|undefined,
  user:DocumentData|undefined,
}

@Injectable({
  providedIn: 'root'
})
export class UserpageResolver  {
  constructor(private readonly _usr:UsermanagementService, private readonly _db : AngularfireService){ }

  // async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<UserData> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): UserData {

    let result = {
      userObs : this._usr.getUserObs(),
      user : this._usr.getUserData()
    }

    // if(result.user.children && result.user.children.length > 0){
      
    //   const childrenInfos = await Promise.all(result.user.children.map((childId: string) => this._db.getUser(childId)));

    //   result.user.children = await Promise.all(result.user.children.map(async (childId: string) => {
    //     const childInfo = childrenInfos.find((child: any) => child.id === childId);
    //     if (childInfo) {
    //       const childData = await this._db.getUser(childId);
    //       return childData;
    //     }
    //     return null;
    //   }));
    // }

    result.userObs = result.userObs?.pipe(
      switchMap(async (user: any) => {
        if(!user.children)
          return user;

        // Getting children infos
        const childrenInfos = await Promise.all(user.children.map((childId:string) => this._db.getUser(childId)));
        
        //Replacing IDs by infos
        user.children = user.children.map((child:string) => child = childrenInfos.find( (childInfo:any) => child == childInfo.id))
        
        return user;
      }))

      return result;
  }
}