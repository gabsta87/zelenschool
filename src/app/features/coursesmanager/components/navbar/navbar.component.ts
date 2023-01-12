import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  navigationItems = [
    {title:"About us",page:"about"},
    {title:"Gallery",page:"gallery"},
    {title:"News",page:"news"},
    {title:"Partners",page:"partners"},
    {title:"Schedule",page:"schedule"},
    {title:"Contacts",page:"contacts"},
    {title:"Donate",page:"donate"},
    {title:"Login",page:"login"},
  ]

  selectMenu(i:number){
    
  }
}
