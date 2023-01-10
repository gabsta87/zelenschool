import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  navigationItems = [
    {title:"About us",page:"mainPage"},
    {title:"Gallery",page:"mainPage"},
    {title:"News",page:"mainPage"},
    {title:"Partners",page:"mainPage"},
    {title:"Schedule",page:"mainPage"},
    {title:"Contacts",page:"mainPage"},
    {title:"Donate",page:"mainPage"},
    {title:"Login",page:"loginPage"},
  ]

  selectMenu(i:number){
    
  }
}
