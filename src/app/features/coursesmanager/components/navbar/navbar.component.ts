import { Component, ElementRef, EventEmitter, Output, ViewChild, ViewChildren } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';
// import {App} from ‘@ionic-angular’;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  // @Output() itemChosen : EventEmitter<number> = new EventEmitter();
  @ViewChildren('aboutIonContent') content!: ElementRef<HTMLInputElement>;

  constructor(private readonly _userS:UsermanagementService, private readonly _router:Router){ }

  isAdmin = this._userS.isLoggedAsAdmin;
  isTeacher = this._userS.isLoggedAsTeacher;
  isLogged = this._userS.isLogged;

  navigationItems = [
    {title:"About us",page:"about",routerLink:"/about",fragment:"about"},
    {title:"Activities",page:"about",routerLink:"/about",fragment:"activities"},
    {title:"Partners",page:"about",routerLink:"/about",fragment:"partners"},
    {title:"Contact",page:"about",routerLink:"/about",fragment:"contact"},
    {title:"Donate",page:"about",routerLink:"/about",fragment:"donate"},
  ]

  simpleNavItems = [
    {title:"Gallery",page:"gallery"},
    {title:"Schedule",page:"schedule"},
  ]

  goToAnchor(link : {title:string,routerLink:string,fragment:string}){
    this._router.navigate([link.routerLink],{fragment:link.fragment});
 
    if(this._router.url.includes("about")){
      let aboutDoc = document.getElementById("anchor_"+link.fragment);

      aboutDoc?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }
  }
}
