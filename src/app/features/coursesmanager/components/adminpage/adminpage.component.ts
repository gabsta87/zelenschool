import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-adminpage',
  templateUrl: './adminpage.component.html',
  styleUrls: ['./adminpage.component.scss']
})
export class AdminpageComponent {
  constructor(
    // private readonly _auth: Auth,
    // private readonly _dbAccess:AngularfireService,
    private readonly _route: ActivatedRoute
  ) {}

  adminData!:any;
  usersList!:any;
  usersListObs!:Observable<any[]>;
  coursesObs!:Observable<any[]>;
  coursesList!:any;

  ionViewWillEnter():void{
    this.adminData = this._route.snapshot.data['adminData'];
    console.log("admin data : ",this.adminData);
    this.usersList = this.adminData.users;
    this.coursesList = this.adminData.courses;
    // console.log("users list : ",this.usersList);
    this.usersListObs = this.adminData.usersObs;
    this.coursesObs = this.adminData.coursesObs;
  }
}
