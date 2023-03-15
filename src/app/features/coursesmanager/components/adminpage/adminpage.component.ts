import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { filter, map, Observable } from 'rxjs';
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

  adminData!:any;
  usersListObs!:Observable<any[]>;
  coursesObs!:Observable<any[]>;

  ionViewWillEnter():void{
    this.adminData = this._route.snapshot.data['adminData'];
    
    this.usersListObs = this.adminData.usersObs;
    this.coursesObs = this.adminData.coursesObs;

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
    return this.usersListObs.pipe(map(e => e.filter( (e:any) => 
      e.status == status
    )))
  }

  private filterBannedUsers(){
    return this.usersListObs.pipe(map(e => e.filter ((e:any) => 
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


}
