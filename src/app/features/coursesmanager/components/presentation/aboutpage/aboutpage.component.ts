import { Component, ElementRef, EventEmitter, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, PopoverController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import dayjs from 'dayjs';
import { LanguageManagerService } from 'src/app/shared/service/language-manager.service';
import { getNowDate } from 'src/app/shared/service/hour-management.service';
import { DocumentData } from 'firebase/firestore';
import { AssoEventPopoverComponent } from '../asso-event-popover/asso-event-popover.component';
var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

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

  words$ = this._lang.currentLanguage$;

  private _positions : any[] = [];
  
  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router:Router, 
    private readonly _lang : LanguageManagerService,
    private readonly _popOver : PopoverController
    ){

    this._route.fragment.subscribe(fragment => { 
      this.fragment = fragment;
    });
  }

  members : Observable<DocumentData[]> = this._route.snapshot.data['aboutData'].members;
  partners_addresses : Observable<DocumentData[]> = this._route.snapshot.data['aboutData'].partners;
  activities : Observable<DocumentData[]> = this._route.snapshot.data['aboutData'].activities;
  assoEvents : DocumentData[] = this._route.snapshot.data['assoEvents'];
  activityDetail = undefined;
  activityRelatedPastEvents:any = undefined;
  groupedPastEvents!:Map<number, DocumentData[]>;
  activityRelatedFutureEvents:any = undefined;
  isActivityDetailOpen = new BehaviorSubject(false);
  
  actualDate = getNowDate();

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

  goToGallery(galleryId:string){
    this._router.navigate(["gallery"],{fragment:galleryId});
  }

  displayActivities(){

    // const activityRelatedEvents = this.assoEvents.filter((evt:any) => receivedActivity.assoEvents.includes(evt.id));
    if(!this.isActivityDetailOpen.value){
      this.activityRelatedPastEvents = this.assoEvents.filter((relatedEvent:any) => dayjs(relatedEvent.timeStart,"DD.MM.YYYY").utc().isBefore(dayjs(this.actualDate).utc()) );
      this.activityRelatedFutureEvents = this.assoEvents.filter((relatedEvent:any) => dayjs(relatedEvent.timeStart,"DD.MM.YYYY").utc().isAfter(dayjs(this.actualDate).utc()));
      
      this.groupedPastEvents = this.groupBy(this.activityRelatedPastEvents);
    }
    this.isActivityDetailOpen.next(!this.isActivityDetailOpen.value);
  }

  goToOtherProjects(){
    this._router.navigate(["assoProjects"]);
  }

  goToCentersPage(){
    this._router.navigate(["centersPage"]);
  }

  private groupBy(listGroupByYear:DocumentData[]){

    let map = new Map<number, DocumentData[]>(); 

    listGroupByYear.forEach((activity:DocumentData) => {
      let year = dayjs(activity['timeStart'],"DD.MM.YYYY").year();
      if(map.get(year) == undefined){
        map.set(year,[])
      }
      map.get(year)?.push(activity)
    } );

    return map;
  }

  async triggerEventInfo(assoEvent : DocumentData){
    
      const popover = await this._popOver.create({
        component: AssoEventPopoverComponent,
        componentProps:{
          assoEvent:assoEvent
        },
        translucent: true,
      });
      popover.present();
  
      // const { role } = await popover.onDidDismiss();
  }
  

}
