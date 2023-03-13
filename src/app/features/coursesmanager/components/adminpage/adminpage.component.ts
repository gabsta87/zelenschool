import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

@Component({
  selector: 'app-adminpage',
  templateUrl: './adminpage.component.html',
  styleUrls: ['./adminpage.component.scss']
})
export class AdminpageComponent {
  constructor(
    // private readonly _auth: Auth,
    private readonly _db:AngularfireService,
    private readonly _route: ActivatedRoute
  ) {}

  adminData!:any;
  usersListObs!:Observable<any[]>;
  coursesObs!:Observable<any[]>;

  ionViewWillEnter():void{
    this.adminData = this._route.snapshot.data['adminData'];
    
    this.usersListObs = this.adminData.usersObs;
    this.coursesObs = this.adminData.coursesObs;
  }

  banUser(id:string){
    this._db.banUser(id,"TODO");
  }

  unbanUser(id:string){
    this._db.unbanUser(id);
  }

  addPartner(){
    // TODO 
    console.log("TODO");
  }
}
