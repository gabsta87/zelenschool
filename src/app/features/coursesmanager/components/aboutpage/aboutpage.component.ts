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
  @ViewChild(IonContent)ionContent!: IonContent;
  @ViewChildren("anchor_") divs!:QueryList<ElementRef>;
  @Output() selectButton : EventEmitter<number> = new EventEmitter();

  fragment!:any;
  myAnchor!:any;

  private _positions : any[] = [];
  constructor(private readonly _route: ActivatedRoute,private readonly _db: AngularfireService){

    this._route.fragment.subscribe(fragment => { 
      this.fragment = fragment;
    });
  }

  members = this._route.snapshot.data['aboutData'].members;
  partners_addresses = this._route.snapshot.data['aboutData'].partners;
  activities = this._route.snapshot.data['aboutData'].activities;

  ionViewWillEnter(){
    if(this.fragment)
      this.scrollTo(this.fragment);
  }

  ionViewDidEnter(){
    this.initElemPositions();
    this.myAnchor = document.querySelector('anchor_' + this.fragment);
  }

  public scrollTo($event:string){
    const row:any = this.divs.find((e:any) => "anchor_"+$event === e.nativeElement.id);
    this.ionContent.scrollToPoint(0,row.nativeElement.offsetTop,250);
  }

  onScroll(event:any) {
    let actualPosition = event.detail.scrollTop;

    let elementToSelectIndex = 0;
    for(let i = 0;i<this._positions.length;i++){
      if(actualPosition >= this._positions[i].nativeElement.offsetTop){
        elementToSelectIndex = i;
      }else{
        break;
      }
    }
    // TODO Color tabs according to position on AboutPage
    // this.navigationComp.setButtonActive(elementToSelectIndex);
    this.selectButton.emit(elementToSelectIndex);

  }

  initElemPositions(){
    if(this._positions.length > 0)
      return;

    this._positions = this.divs.filter((e:any) => e.nativeElement.id.includes("anchor_"))
  }

  goToGallery(galleryName:string){
    console.log("todo");
    
  }

}
