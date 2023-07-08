import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit{
  title = 'zelenschool';

  @ViewChildren('aboutIonContent') content!: ElementRef<HTMLInputElement>;
  @ViewChildren('navbar') navbar!: ElementRef<HTMLInputElement>;
  @ViewChildren("aboutIonContent") divs!:QueryList<ElementRef>;

  myAnchor !: any;

  ngAfterViewInit(){

    this.myAnchor = document.querySelector('aboutIonContent');
    console.log("app component");
    

    console.log("content : ",this.content);
    console.log("navBar : ",this.navbar);
    console.log("my anchor : ",this.myAnchor);
    console.log("divs : ",this.divs);
    
  }
}
