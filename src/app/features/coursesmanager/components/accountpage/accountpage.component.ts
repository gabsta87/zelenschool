import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';
import { bdValidator, emailValidator,permitValidator,phoneValidator,passwordValidator } from 'src/app/shared/service/validators-lib.service';

@Component({
  selector: 'app-accountpage',
  templateUrl: './accountpage.component.html',
  styleUrls: ['./accountpage.component.scss']
})
export class AccountpageComponent {
  userData = this._route.snapshot.data['userData'];
  userObs!:Observable<any>;

  profileForm!:FormGroup<any>;

  constructor(
    private readonly _user:UsermanagementService,
    private readonly _router:Router,
    private readonly _route:ActivatedRoute
  ){
    this.loadData()
  }

  ionViewWillEnter(){
    this.loadData();
  }

  loadData(){
    let myValue = this.userData.user;

    this.profileForm = new FormGroup({
      email : new FormControl(myValue.email,emailValidator()),
      f_name : new FormControl(myValue.f_name,Validators.required),
      l_name : new FormControl(myValue.l_name,Validators.required),
      phone : new FormControl(myValue.phone,phoneValidator()),
      address : new FormControl(myValue.address,Validators.required),
      s_permit_number : new FormControl(myValue.s_permit_id,permitValidator()),
      birthday : new FormControl(myValue.birthday,bdValidator()),
    })
  }

  async logout(){
    this._user.logout();
    this._router.navigate(['/login/']);
  }

  update(){

    let updateItem = {
      email : this.profileForm.get('email')?.value,
      l_name : this.profileForm.get('l_name')?.value,
      f_name : this.profileForm.get('f_name')?.value,
      phone : this.profileForm.get('phone')?.value,
      address : this.profileForm.get('address')?.value,
      s_permit_id : this.profileForm.get('s_permit_number')?.value,
      birthday : this.profileForm.get('birthday')?.value
    }
    this._user.updateUser(updateItem);
  }

  cancel(){

  }

}
