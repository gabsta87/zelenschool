import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(private readonly _userS:UsermanagementService, private readonly _router:Router){}

  isAdmin = this._userS.isLoggedAsAdmin;
  isTeacher = this._userS.isLoggedAsTeacher;
  isLogged = this._userS.isLogged;

  navigationItems = [
    {title:"About us",page:"about"},
    // {title:"Activities",page:"about#activities", fragment:"activities"},
    // {title:"Partners",page:"about#partners"},
    // {title:"Contact",page:"about#contact"},
    // {title:"Donate",page:"about#donate"},
    // {title:"Activities",page:"about",routerLink:"/about",fragment:"activities"},
    {title:"Activities",page:"about#activities",routerLink:"/about#activities",fragment:"activities"},
    {title:"Partners",page:"about#partners",routerLink:"/about",fragment:"partners"},
    {title:"Contact",page:"about#contact",routerLink:"/about",fragment:"contact"},
    {title:"Donate",page:"about#donate", routerLink:"/about",fragment:"donate"},
    {title:"Gallery",page:"gallery"},
    {title:"Schedule",page:"schedule"},
  ]
}
