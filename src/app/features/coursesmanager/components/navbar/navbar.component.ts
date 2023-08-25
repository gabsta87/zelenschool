import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageManagerService } from 'src/app/shared/service/language-manager.service';
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

  constructor(private readonly _userS:UsermanagementService, private readonly _router:Router, readonly _lang:LanguageManagerService){ }

  // ngAfterViewInit(){ 
  //   // Finds emtpy results
  //   this.myAnchor = document.querySelector('aboutIonContent'); 
  //   console.log("from navBar ");
  //   console.log("content : ",this.content);
  //   console.log("navbar : ",this.navbar);
  //   console.log("aboutIonContent : ",this.divs);
  // }

  isAdmin = this._userS.isLoggedAsAdmin;
  isTeacher = this._userS.isLoggedAsTeacher;
  isLogged = this._userS.isLogged;

  words$ = this._lang.currentLanguage$;

  navigationItems = [
    {title:"about",page:"about",routerLink:"/about",fragment:"about",iconName:"information-circle-outline"},
    {title:"activities",page:"about",routerLink:"/about",fragment:"activities",iconSrc:"../../assets/icons/activities.svg"},
    {title:"partners",page:"about",routerLink:"/about",fragment:"partners",iconSrc:"../../assets/icons/partners.svg"},
    {title:"contact",page:"about",routerLink:"/about",fragment:"contact",iconName:"call-outline"},
    {title:"donate",page:"about",routerLink:"/about",fragment:"donate",iconSrc:"../../assets/icons/donate.svg"},
  ]

  simpleNavItems = [
    {title:"gallery",page:"gallery",iconName:"images-outline"},
    {title:"schedule",page:"schedule",iconName:"calendar-number-outline"},
  ]

  goToAnchor(link : {title?:string,routerLink:string,fragment:string}){
    this._router.navigate([link.routerLink],{fragment:link.fragment});
 
    if(this._router.url.includes("about")){
      let aboutDoc = document.getElementById("anchor_"+link.fragment);
      
      aboutDoc?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }
  }

  changeLanguage(lang:string){
    this._lang.changeLanguageTo(lang);
    this._lang.saveUserLanguage(lang);
    this.closeLangPopover();
  }

  isLangPopoverOpen = false;

  showLangPopover(){
    this.isLangPopoverOpen = true;
  }
  
  closeLangPopover(){
    this.isLangPopoverOpen = false;
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