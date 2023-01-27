import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  navigationItems = [
    {title:"About us",page:"about"},
    {title:"Projects",page:"projects"},
    {title:"Gallery",page:"gallery"},
    {title:"Partners",page:"partners"},
    {title:"Schedule",page:"schedule"},
    {title:"Contact",page:"contact"},
    {title:"Donate",page:"donate"},
    {title:"Login",page:"login"},
  ]
}
