import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, ActivationEnd } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
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

    result.coursesObs = result.coursesObs.pipe(
      switchMap(async (courses:any) => {
        
        // Récupération des IDs des auteurs
        const authorId = courses.map( (course:any) => course.author)

        // Récupération des infos des auteurs 
        const authorInfos = await Promise.all(authorId.map((authorID:any) => this._db.getUser(authorID)));

        // Remplace les IDs par les données des utilisateurs
        courses.map((course:any) => course.author = authorInfos.find((e:any) => e.id === course.author));


        // Récupération des IDs des participants
        const attendants = courses.flatMap( (course:any) => course.attendantsId );

        // Récupération des infos des participants
        const attendantsInfos = await Promise.all(attendants.map((student:any) => this._db.getUser(student)));

        // Remplacement des IDs par les données des utilisateurs
        courses.map((course:any) => course.attendantsId = course.attendantsId.map((studentId:string) => 
          studentId = attendantsInfos.find((e:any) => e.id == studentId)
        ));

        return courses;
      })
    );
    
    return result;
  }
}
