import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';
import { bdValidator, emailValidator,permitValidator,phoneValidator } from 'src/app/shared/service/validators-lib.service';

@Component({
  selector: 'app-accountpage',
  templateUrl: './accountpage.component.html',
  styleUrls: ['./accountpage.component.scss']
})
export class AccountpageComponent {
  userData = this._route.snapshot.data['userData'];
  userObs!:Observable<any>;

  profileForm = new FormGroup({
    email : new FormControl(this.userData.user.email?this.userData.user.email:"",emailValidator()),
    f_name : new FormControl(this.userData.user.f_name?this.userData.user.f_name:"",Validators.required),
    l_name : new FormControl(this.userData.user.l_name?this.userData.user.f_name:"",Validators.required),
    phone : new FormControl(this.userData.user.phone?this.userData.user.phone:"",phoneValidator()),
    address : new FormControl(this.userData.user.address?this.userData.user.address:"",Validators.required),
    // s_permit_number : new FormControl(this.userData.user.s_permit_id,permitValidator()),
    birthday : new FormControl(this.userData.user.birthday?this.userData.user.birthday:"",bdValidator()),
  });

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
      address : this.profileForm.get('address')?.value,
      // s_permit_id : this.profileForm.get('s_permit_number')?.value,
      birthday : this.profileForm.get('birthday')?.value
    }
    this._user.updateUser(updateItem);
  }

  cancel(){
    this.profileForm.controls['email'].setValue(this.userData.user.email);
    this.profileForm.controls['f_name'].setValue(this.userData.user.f_name);
    this.profileForm.controls['l_name'].setValue(this.userData.user.l_name);
    this.profileForm.controls['phone'].setValue(this.userData.user.phone);
    this.profileForm.controls['address'].setValue(this.userData.user.address);
    // this.profileForm.controls['s_permit_number'].setValue(this.userData.user.s_permit_id);
    this.profileForm.controls['birthday'].setValue(this.userData.user.birthday);
  }

}
