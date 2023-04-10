import { Injectable } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, ActivationEnd } from '@angular/router';
import { Observable, firstValueFrom, switchMap } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

interface AdminData{
  articles:any[],
  usersObs:Observable<DocumentData[]>,
  coursesObs:Observable<DocumentData[]>,
  assoMembers:Observable<DocumentData[]>,
  partners:Observable<DocumentData[]>,
  partnersData : {id:string,link:string,logoName:string,photoChanged:boolean}[];
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
          studentId = attendantsInfos.find((e:any) => e && e.id ? e.id == studentId : false)
        ));

        return courses;
      })
    );

    result.assoMembers = this._db.getAssoMembers();

    result.partners = this._db.getPartners();

    let temp = await firstValueFrom(result.partners);

    result.partnersData = [];
    temp.forEach((e:any)=> result.partnersData.push({
      id:e['id'],
      link:e['link'],
      logoName:e['logoName'],
      photoChanged:false,
    }))
    
    return result;
  }
}
