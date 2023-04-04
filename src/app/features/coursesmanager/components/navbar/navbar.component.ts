import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(private readonly _userS:UsermanagementService, private readonly _router:Router){
    _router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        const tree = _router.parseUrl(_router.url);
        if (tree.fragment) {
          const element = document.querySelector("#" + tree.fragment);
          if (element) { element.scrollIntoView(true); }
        }
      }
    });
  }

  isAdmin = this._userS.isLoggedAsAdmin;
  isTeacher = this._userS.isLoggedAsTeacher;
  isLogged = this._userS.isLogged;

  navigationItems = [
    {title:"About us",routerLink:"/about",fragment:"about"},
    {title:"Activities",routerLink:"/about",fragment:"activities"},
    {title:"Partners",routerLink:"/about",fragment:"partners"},
    {title:"Contact",routerLink:"/about",fragment:"contact"},
    {title:"Donate",routerLink:"/about",fragment:"donate"},
  ]

  simpleNavItems = [
    {title:"Gallery",page:"gallery"},
    {title:"Schedule",page:"schedule"},
  ]

  goToAnchor(routerLink:string|undefined,fragment?:string|undefined){
    console.log("current url : ",this._router.url);
    
    if(!fragment){
      console.log("Going to link ",routerLink);
      this._router.navigate( [routerLink]);
    }else{
      console.log("Going to link ",routerLink," and anchor ",fragment);
      this._router.navigate( [routerLink], {fragment: fragment});
    }
  }
}
