import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(private readonly _userS:UsermanagementService){}

  // isAdmin = this._userS.isAdmin();
  isAdmin = new BehaviorSubject(this._userS.isLoggedAsAdmin);

  isLogged = this._userS.isLogged;

  navigationItems = [
    {title:"About us",page:"about"},
    {title:"Projects",page:"projects"},
    {title:"Gallery",page:"gallery"},
    {title:"Partners",page:"partners"},
    {title:"Schedule",page:"schedule"},
    {title:"Contact",page:"contact"},
    {title:"Donate",page:"donate"},
    // {title:"Login",page:"login"},
  ]
}
