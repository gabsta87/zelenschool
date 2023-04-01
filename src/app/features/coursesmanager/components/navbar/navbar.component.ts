import { Component } from '@angular/core';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(private readonly _userS:UsermanagementService){}

  isAdmin = this._userS.isLoggedAsAdmin;
  isTeacher = this._userS.isLoggedAsTeacher;
  isLogged = this._userS.isLogged;
  // status = this._userS.status;

  navigationItems = [
    {title:"About us",page:"about"},
    {title:"Activities",routerLink:"about",fragment:"activities"},
    {title:"Partners",routerLink:"about",fragment:"partners"},
    {title:"Contact",routerLink:"about",fragment:"contact"},
    {title:"Donate",routerLink:"about",fragment:"donate"},
    {title:"Gallery",page:"gallery"},
    {title:"Schedule",page:"schedule"},
  ]
}
