import { Component } from '@angular/core';
import { FormControl,FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent {
  user:{email:string,password:string,password2:string,s_permit:string,b_day:string,f_name:string,l_name:string,phone:string}
  ={email:"",password:"",password2:"",s_permit:"",b_day:"",f_name:"",l_name:"",phone:""}

  register(){

  }
}
