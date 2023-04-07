import { Component, ElementRef, EventEmitter, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

@Component({
  selector: 'app-aboutpage',
  templateUrl: './aboutpage.component.html',
  styleUrls: ['./aboutpage.component.scss']
})
export class AboutpageComponent {
  @ViewChild('aboutIonContent') myDiv!: ElementRef;
  @ViewChild(IonContent)ionContent!: IonContent;
  element!: HTMLElement;

  constructor(private readonly _router : Router,private readonly _route: ActivatedRoute,private readonly _db: AngularfireService){
    // TODO change subscribe to map
    this._route.fragment.subscribe(fragment => { 
      // console.log("updating fragment : ",fragment);
      
      this.fragment = fragment; 

      this.myAnchor = document.querySelector('#' + this.fragment);
      
      // if(this.myAnchor && this.fragment){
      //   console.log("subscribe : scrolling to");
      //   this.scrollToElement(this.myAnchor);
      // }
    });
  }

  members = this._route.snapshot.data['aboutData'].members;
  partners_addresses = this._route.snapshot.data['aboutData'].partners;

  ionViewWillEnter(){
    console.log("Ion View Will Enter");
    try {
      if(document){
        this.myAnchor = document.querySelector('#' + this.fragment);
        console.log("anchor : ",this.myAnchor);
        console.log("fragment : ",this.fragment);
        
        if(this.myAnchor && this.fragment){
          console.log("ViewWillEnter : scrolling to");
          
          // this.scrollToElement(this.myAnchor);
        }
      }
    } catch (e) { }
  }

  ngAfterViewInit(){
    console.log("After view init");
    if(this.myAnchor){
      console.log("After view : scrolling to");
      // this.scrollToElement(this.myAnchor);
    }
  }

  ionViewDidEnter(){
    console.log("Ion view did enter");
    if(this.myAnchor){
      console.log("DidEnter : scrolling to");
      // this.scrollToElement(this.myAnchor);
    }
  }

  fragment!:any;
  myAnchor!:any;
  private _positions : any[] = [];
  @ViewChildren("anchor_") divs!:QueryList<ElementRef>;
  @Output() selectButton : EventEmitter<number> = new EventEmitter();

  scrollTo($event:string){
    const row:any = this.divs.find((e:any) => "anchor_"+$event === e.el.id);
    console.log("row : ",row);
    
    // console.log("scrolling to row = ",row);
    this.ionContent.scrollToPoint(0,row.el.offsetTop,250);
  }

  onScroll(event:any) {
    console.log("scrolling ",event.detail.scrollTop);
    
    this.initElemPositions();
    let actualPosition = event.detail.scrollTop;
    // this._positions.map((e:any)=> console.log(e.el.offsetTop));

    let elementToSelectIndex = 0;
    for(let i = 0;i<this._positions.length;i++){
      if(actualPosition >= this._positions[i].nativeElement.offsetTop){
        elementToSelectIndex = i;
      }else{
        break;
      }
    }
    // TODO
    // this.navigationComp.setButtonActive(elementToSelectIndex);
    this.selectButton.emit(elementToSelectIndex);

  }


  // scrollToElement(element:any): void {
  //   console.log("scrollToElement : ",element);
    
  //   element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  // }


  initElemPositions(){
    if(this._positions.length > 0)
      return;

    console.log("divs : ",this.divs);
    
    console.log("sibling : ",(this.divs as any).nextSibling);
    

    this._positions = this.divs.filter((e:any) => {
      console.log("e : ",e);
      
      return e.nativeElement.id.includes("anchor_")
    })
    console.log("positions : ",this._positions);
    
  }

}
