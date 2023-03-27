import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';
import { emailValidator,phoneValidator,passwordValidator } from 'src/app/shared/service/validators-lib.service';

@Component({
  selector: 'app-accountadminpage',
  templateUrl: './accountadminpage.component.html',
  styleUrls: ['./accountadminpage.component.scss']
})
export class AccountadminpageComponent {
  userData = this._route.snapshot.data['userData'];
  userObs!:Observable<any>;

  profileForm = new FormGroup({
      email : new FormControl(this.userData.user.email?this.userData.user.email:"",emailValidator()),
      f_name : new FormControl(this.userData.user.f_name?this.userData.user.f_name:"",Validators.required),
      l_name : new FormControl(this.userData.user.l_name?this.userData.user.l_name:"",Validators.required),
      phone : new FormControl(this.userData.user.phone?this.userData.user.phone:"",phoneValidator()),
    })

  constructor(
    private readonly _user:UsermanagementService,
    private readonly _router:Router,
    private readonly _route:ActivatedRoute
  ){ }

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
    };
    this._user.updateUser(updateItem);
  }

  cancel(){
    this.profileForm.controls['email'].setValue(this.userData.user.email);
    this.profileForm.controls['f_name'].setValue(this.userData.user.f_name);
    this.profileForm.controls['l_name'].setValue(this.userData.user.l_name);
    this.profileForm.controls['phone'].setValue(this.userData.user.phone);
  }



}
