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

  navigationItems = [
    {title:"About us",page:"about"},
    {title:"Activities",page:"activities"},
    {title:"Gallery",page:"gallery"},
    {title:"Partners",page:"partners"},
    {title:"Schedule",page:"schedule"},
    {title:"Contact",page:"contact"},
    {title:"Donate",page:"donate"},
  ]
}
