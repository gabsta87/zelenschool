import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @ViewChildren('aboutIonContent') content!: ElementRef<HTMLInputElement>;
  @ViewChildren('navbar') navbar!: ElementRef<HTMLInputElement>;
  @ViewChildren("aboutIonContent") divs!:QueryList<ElementRef>;

  myAnchor !: any;

  ionViewWillEnter(){

    this.myAnchor = document.querySelector('aboutIonContent');

    console.log("content : ",this.content);
    console.log("navBar : ",this.navbar);
    console.log("my anchor : ",this.myAnchor);
    console.log("divs : ",this.divs);
    
  }
}
