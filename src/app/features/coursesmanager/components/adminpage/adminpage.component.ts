import { Component } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { BehaviorSubject, combineLatest, count, filter, firstValueFrom, map, Observable } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { BanmodalComponent } from '../banmodal/banmodal.component';

@Component({
  selector: 'app-adminpage',
  templateUrl: './adminpage.component.html',
  styleUrls: ['./adminpage.component.scss']
})
export class AdminpageComponent {
  constructor(
    private readonly _db:AngularfireService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _modal: ModalController,
    private readonly actionSheetCtrl: ActionSheetController
  ) {}

  adminData = this._route.snapshot.data['adminData'];
  
  usersListObs:Observable<DocumentData[]> = this.adminData.usersObs;
  coursesObs:Observable<DocumentData[]> = this.adminData.coursesObs;
  searchString = "";
  statusToFilter = "all";
  timeFilter = "all";

  requestsCount = this.usersListObs.pipe(
    map(usersList =>usersList.filter((user:any) => user.status == 'request')),
    map(filteredUsers => filteredUsers.length)
  )
  
  search = new BehaviorSubject("");
  filterUsersActivated = new BehaviorSubject("all");
  filterCoursesActivated = new BehaviorSubject("all");

  filteredDataObs = combineLatest([
    this.search.asObservable(),
    this.usersListObs,
    this.coursesObs,
    this.filterUsersActivated.asObservable(),
    this.filterCoursesActivated.asObservable(),
  ]).pipe(
    map(([searchString, users, courses, usersFilter, coursesFilter]) => {

      if(searchString == "" && usersFilter == "all" && coursesFilter == "all")
          return [users,courses];

      switch(usersFilter){
        case "all":
          break;
        case "ban":
          users = users.filter ((e:any) => e.ban != undefined)
          break;
        default:
          users = users.filter( (user:any) => user.status == usersFilter )
          break;
      }

      switch(coursesFilter){
        case "all":
          break;
        case "future":
          courses = courses.filter((course:any) => dayjs(course.eventDate).isAfter(new Date()) )
          break;
        case "past":
          courses = courses.filter((course:any) => dayjs(course.eventDate).isBefore(new Date()) )
          break;
        default:
          break;
      }

      const filteredUsers = users.filter((user:any) => 
        user.f_name.toLowerCase().includes(searchString.toLowerCase()) ||
        user.l_name.toLowerCase().includes(searchString.toLowerCase())
      );
      const filteredCourses = courses.filter((course:any) =>
        course.description?.toLowerCase().includes(searchString.toLowerCase()) ||
        course.title.toLowerCase().includes(searchString.toLowerCase()) ||
        course.author.l_name.toLowerCase().includes(searchString.toLocaleLowerCase()) ||
        course.author.f_name.toLowerCase().includes(searchString.toLocaleLowerCase()) ||
        course.attendantsId.find((e:any) => 
          e.l_name.toLowerCase().includes(searchString.toLowerCase()) ||
          e.f_name.toLowerCase().includes(searchString.toLowerCase())
        )
      );
      return [filteredUsers, filteredCourses];
    })
  );

  updateSearchValue(){
    this.search.next(this.searchString);
  }

  filterRequests(){
    this.statusToFilter = "request";
  }

  filterUsersList(){
    this.filterUsersActivated.next(this.statusToFilter);
  }

  filterCoursesList(){
    this.filterCoursesActivated.next(this.timeFilter);
  }

  async banUser(id:string){

    const modal = await this._modal.create({
      component:BanmodalComponent
    })
    modal.present();

    const { data,role } = await modal.onWillDismiss();

    if(role == "confirm")
      this._db.banUser(id,data);

  }

  async deleteUser(id:string){

    let response = await this.canDismiss();
    if(!response)
      return;

    this._db.removeUser(id);
    return this._modal.dismiss(null, 'delete');
  }


  canDismiss = async () => {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Are you sure?',
      buttons: [
        {
          text: 'Delete',
          role: 'confirm',
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();

    return role === 'confirm';
  };

  acceptRequest(id:string){
    this._db.acceptRequest(id);
  }

  unbanUser(id:string){
    this._db.unbanUser(id);
  }

  addPartner(){
    this._router.navigate(['/imageUpload/']);

  }

  addMember(){
    this._router.navigate(['/imageUpload/']);
  }

  addPhotoToGallery(){
    this._router.navigate(['/imageUpload/']);

  }
}
