import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

  ionViewWillEnter():void{
    this.adminData = this._route.snapshot.data['adminData'];
    console.log("admin data : ",this.adminData);
    
  }
}
