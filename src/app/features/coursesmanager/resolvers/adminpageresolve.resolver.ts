import { Injectable } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, firstValueFrom, switchMap, mergeMap } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

interface AdminData{
  usersObs:Observable<DocumentData[]>,
  coursesObs:Observable<DocumentData[]>,
  assoMembers:Observable<DocumentData[]>,
  partners:Observable<DocumentData[]>,
  partnersData : {id:string,link:string,logoName:string,photoChanged:boolean}[],
  rooms : Observable<DocumentData[]>,
  roomsData : {id:string,name:string,maxStudents:number}[],
  galleries : Observable<DocumentData[]>;
  activities : DocumentData[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminpageresolveResolver  {

  constructor(private readonly _db: AngularfireService){}
  
  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<AdminData> {

    let result = {} as AdminData;

    result.usersObs = this._db.getUsers();

    result.usersObs = result.usersObs.pipe(
      switchMap(async (users: any) => {

        // Loading children infos

        // Filtering users with children
        const parents = users.filter((user:any) => user.children != undefined && user.children.length > 0)

        // Getting children IDs
        let childrenId : string[]= [];
        parents.map((usr: any) => {usr.children.forEach((e:string) => childrenId.push(e))});
        
        // Getting children infos
        const childrenInfos = await Promise.all(childrenId.map((childId:any) => this._db.getUser(childId)));

        //Replacing children IDs by infos
        // parents.map((usr:any) => usr.children.map((id:any) => id = childrenInfos.find( (child:any) => child == id)))
        parents.forEach((usr: any) => {
          usr.children.forEach((id: any, index: number) => {
            const childInfo = childrenInfos.find((child: any) => child.id === id);
            if (childInfo) {
              usr.children[index] = childInfo;
            }
          });
        });

        // Loading parents infos

        // Filtering users with parents
        const children = users.filter((user:any) => user.parent != undefined)

        // Replacing parent ID by infos
        children.map((user:any) => user.parent = parents.find((e:any) => e.id === user.parent));
        
        // Loading ban authors infos
        // Filtering banned users
        const bannedUsers = users.filter((user:any) => user.ban != undefined)

        // Getting ban authors IDs
        const banAuthorId = bannedUsers.map((usr: any) => usr.ban.authorID);

        // Getting ban author infos
        const authorInfos = await Promise.all(banAuthorId.map((authorID:any) => this._db.getUser(authorID)));
        
        // Replacing IDs by infos
        bannedUsers.map((usr:any) => usr.ban.author = authorInfos.find((e:any) => e.id === usr.ban.authorID));

        return users;
      })
    );

    result.coursesObs = this._db.getCalendarEntries();

    result.coursesObs = result.coursesObs.pipe(
      switchMap(async (courses:any) => {
        
        // Récupération des IDs des auteurs
        const authorId = courses.map( (course:any) => course.author)

        // Récupération des infos des auteurs 
        const authorInfos = await Promise.all(authorId.map((authorID:any) => this._db.getUser(authorID)));

        // Filtering undefined values (due to users deleted by admins mostly)
        const authorInfosFiltered = authorInfos.filter((item) => item)

        // Remplace les IDs par les données des utilisateurs
        courses.map((course:any) => course.author = authorInfosFiltered.find((e:any) => e.id === course.author));

        // Récupération des IDs des participants
        const attendants = courses.flatMap( (course:any) => course.attendantsId );

        // Récupération des infos des participants
        const attendantsInfos = await Promise.all(attendants.map((student:any) => this._db.getUser(student)));

        // Remplacement des IDs par les données des utilisateurs
        courses.map((course:any) => course.attendants = course.attendantsId.map((studentId:string) => 
          studentId = attendantsInfos.find((e:any) => e && e.id ? e.id == studentId : false)
        ));

        // Récup des IDs des salles
        const rooms = courses.flatMap( (course:any) => course.room_id)

        const roomsInfos = await Promise.all(rooms.map((room:any) => this._db.getRoom(room)));

        courses.map((course:any) => course.room = roomsInfos.find((e:any) => e.id == course.room_id))

        return courses;
      })
    );

    result.assoMembers = this._db.getAssoMembers();

    result.partners = this._db.getPartners();

    const temp = await firstValueFrom(result.partners);

    result.partnersData = [];
    temp.forEach((e:any)=> result.partnersData.push({
      id:e['id'],
      link:e['link'],
      logoName:e['logoName'],
      photoChanged:false,
    }))
    
    result.rooms = this._db.getRooms();

    const temp2 = await firstValueFrom(result.rooms);
    result.roomsData = [];
    temp2.forEach((e:any) => result.roomsData.push({
      id : e['id'],
      maxStudents : e['maxStudents'],
      name : e['name'],
    }))

    result.galleries = this._db.getGalleries();

    result.activities = await this._db.getActivities();

    return result;
  }
}
