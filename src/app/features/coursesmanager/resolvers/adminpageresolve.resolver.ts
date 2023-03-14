import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { filter, firstValueFrom, Observable, switchMap } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

interface AdminData{
  articles:any[],
  usersObs:Observable<any[]>,
  coursesObs:Observable<any[]>,
}

@Injectable({
  providedIn: 'root'
})
export class AdminpageresolveResolver implements Resolve<AdminData> {

  constructor(private readonly _db: AngularfireService){}
  
  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<AdminData> {

    let result = {} as AdminData;

    result.usersObs = this._db.getUsers();

    result.usersObs = result.usersObs.pipe(
      switchMap(async (user: any) => {

        // Filtrage des utilisateurs ayant été bannis
        const bannedUsers = user.filter((user:any) => user.ban != undefined)

        // Récupère les IDs des auteurs de chaque ban
        const banAuthorId = bannedUsers.map((usr: any) => usr.ban.authorID);

        // Récupère les infos des auteurs
        const authorInfos = await Promise.all(banAuthorId.map((authorID:any) => this._db.getUser(authorID)));
        
        // Remplace les IDs par les données des utilisateurs
        bannedUsers.map((usr:any) => usr.ban.author = authorInfos.find((e:any) => e.id === usr.ban.authorID));

        return user;
      })
    );

    result.coursesObs = this._db.getCalendarEntries();
    
    return result;
  }
}
