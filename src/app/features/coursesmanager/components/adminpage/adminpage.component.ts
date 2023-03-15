import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { BehaviorSubject, combineLatest, filter, map, Observable } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { BanmodalComponent } from '../banmodal/banmodal.component';

@Component({
  selector: 'app-adminpage',
  templateUrl: './adminpage.component.html',
  styleUrls: ['./adminpage.component.scss']
})
export class AdminpageComponent {
  constructor(
    // private readonly _auth: Auth,
    private readonly _db:AngularfireService,
    private readonly _route: ActivatedRoute,
    private readonly _modal: ModalController,
  ) {}

  // usersListObs!:Observable<any[]>;
  // coursesObs!:Observable<any[]>;

  adminData = this._route.snapshot.data['adminData'];
  
  usersListObs = this.adminData.usersObs;
  coursesObs = this.adminData.coursesObs;
  searchString = "";
  
  // search = new BehaviorSubject(null as any);
  // searchUserOption = "";
  // usersListObs = combineLatest([
  //   this.adminData.usersObs as Observable<any[]>,
  //   this.search.asObservable()
  // ]).pipe(
  //   map(observables => {
  //     const list = observables[0];
  //     const searchStr: any = observables[1];
  //     if (!searchStr) {
  //       return list;
  //     }
  //     return list.filter((user:any) => 
  //       user.f_name.toLowerCase().includes(this.searchString.toLowerCase()) ||
  //       user.l_name.toLowerCase().includes(this.searchString.toLowerCase())
  //     )
  //   })
  // );

  updateValue(){
    // this.search.next(this.searchString);

    this.usersListObs = this.usersListObs.pipe(
      map((e:any) => e.filter((user:any) => 
        user.f_name.toLowerCase().includes(this.searchString.toLowerCase()) ||
        user.l_name.toLowerCase().includes(this.searchString.toLowerCase())
      ))
    )

    this.coursesObs = this.coursesObs.pipe(
      map((e:any) => e.filter((course:any) =>
        course.description?.toLowerCase().includes(this.searchString.toLowerCase()) ||
        course.title.toLowerCase().includes(this.searchString.toLowerCase()) ||
        course.author.l_name.toLowerCase().includes(this.searchString.toLocaleLowerCase()) ||
        course.author.f_name.toLowerCase().includes(this.searchString.toLocaleLowerCase()) ||
        course.attendantsId.find((e:any) => 
          e.l_name.toLowerCase().includes(this.searchString.toLowerCase()) ||
          e.f_name.toLowerCase().includes(this.searchString.toLowerCase())
        )
      ))
    )
  }

  filterUsersList($event : any){
    this.usersListObs = this.adminData.usersObs;
    switch($event.detail.value){
      case "students":
        this.usersListObs = this.filterStatus("student");
        break;
      case "teachers":
        this.usersListObs = this.filterStatus("teacher");
        break;
      case "admins":
        this.usersListObs = this.filterStatus("admin");
        break;
      case "requests":
        this.usersListObs = this.filterStatus("request");
        break;
      case "bans":
        this.usersListObs = this.filterBannedUsers();
        break;
      default:
        this.usersListObs = this.adminData.usersObs;
        break;
    }
  }

  private filterStatus(status:string){
    return this.usersListObs.pipe(map((e:any) => e.filter( (user:any) => 
      user.status == status
    )))
  }

  private filterBannedUsers(){
    return this.usersListObs.pipe(map((e:any) => e.filter ((e:any) => 
      e.ban != undefined
    )))
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

  unbanUser(id:string){
    this._db.unbanUser(id);
  }

  addPartner(){
    // TODO 
    console.log("TODO");
  }

  filterCoursesList($event:any){
    this.filterCourses($event.detail.value);
  }

  private filterCourses(option:string){
    this.coursesObs = this.adminData.coursesObs;
    switch(option){
      case "future":
        this.coursesObs = this.coursesObs.pipe(map((e:any) => e.filter((course:any) => dayjs(course.eventDate).isAfter(new Date()) )))
        break;
      case "past":
        this.coursesObs = this.coursesObs.pipe(map((e:any) => e.filter((course:any) => dayjs(course.eventDate).isBefore(new Date()) )))
        break;
      default:
        this.coursesObs = this.adminData.coursesObs;
        break;
    }
  }


}
