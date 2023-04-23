import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
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

  @ViewChildren('navbar') navbar!: ElementRef<HTMLInputElement>;
  @ViewChildren("aboutIonContent") divs!:QueryList<ElementRef>;
  myAnchor !: any;

  constructor(private readonly _userS:UsermanagementService, private readonly _router:Router){ }

  ngAfterViewInit(){
    this.myAnchor = document.querySelector('aboutIonContent');
  }

  isAdmin = this._userS.isLoggedAsAdmin;
  isTeacher = this._userS.isLoggedAsTeacher;
  isLogged = this._userS.isLogged;

  navigationItems = [
    {title:"About us",page:"about",routerLink:"/about",fragment:"about",iconName:"information-circle-outline"},
    {title:"Activities",page:"about",routerLink:"/about",fragment:"activities",iconSrc:"../../assets/icons/activities.svg"},
    {title:"Partners",page:"about",routerLink:"/about",fragment:"partners",iconSrc:"../../assets/icons/partners.svg"},
    {title:"Contact",page:"about",routerLink:"/about",fragment:"contact",iconName:"call-outline"},
    {title:"Donate",page:"about",routerLink:"/about",fragment:"donate",iconSrc:"../../assets/icons/donate.svg"},
  ]

  simpleNavItems = [
    {title:"Gallery",page:"gallery",iconName:"images-outline"},
    {title:"Schedule",page:"schedule",iconName:"calendar-number-outline"},
  ]

  goToAnchor(link : {title:string,routerLink:string,fragment:string}){
    this._router.navigate([link.routerLink],{fragment:link.fragment});
 
    if(this._router.url.includes("about")){
      let aboutDoc = document.getElementById("anchor_"+link.fragment);
      
      aboutDoc?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }
  }
}


// tab-selected
  // setButtonActive(index:number){
  //   this.ionItems.map((e:any)=> e.el.className = e.el.className.replace("active",""));
  //   // let selectedItem:IonItem|undefined = this.ionItems.find((e:any)=> e.el.id === "menu_button_"+index);
  //   let selectedItem:any = this.ionItems.find((e:any)=> e.el.id === "menu_button_"+index);
  //   if(selectedItem)
  //     selectedItem.el.className += " active";
  // }