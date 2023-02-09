import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, Output, EventEmitter, } from '@angular/core';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours, } from 'date-fns';
import { WeekDay, MonthView, MonthViewDay, ViewPeriod, } from 'calendar-utils';
import { elementAt, firstValueFrom, map, Observable, Subject, switchMap } from 'rxjs';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView, } from 'angular-calendar';
import { EventColor } from 'calendar-utils';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import * as dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc';
// import timezone from 'dayjs/plugin/timezone';

// dayjs.extend(utc);
// dayjs.extend(timezone); 

// const mytime = dayjs().tz("Europe/Berlin");

import { DocumentData } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { IonModal, ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';


export interface CalendarMonthViewEventTimesChangedEvent<
  EventMetaType = any,
  DayMetaType = any
> extends CalendarEventTimesChangedEvent<EventMetaType> {
  day: MonthViewDay<DayMetaType>;
}

const colors: Record<string, EventColor> = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-schedulepage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedulepage.component.html',
  styleUrls: ['./schedulepage.component.scss']
})
export class SchedulepageComponent {
  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild(IonModal) studentModal!: IonModal;
  
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  clickedDate: dayjs.Dayjs = dayjs(this.viewDate);
  isTeacher:Boolean = false;
  isAdmin:Boolean = false;

  newEvent:{title:string,time:string,room:number,max_participants:number} = {title:"",time:"",room:-1,max_participants:0};

  // extractedData:Observable<any> = this._route.snapshot.data["scheduleData"];
  extractedData!:DocumentData[];

  constructor(
    private readonly _db : AngularfireService,    
    private readonly _route: ActivatedRoute,
    private readonly _user: UsermanagementService
    ) {
      // dayjs.tz.setDefault('');
    }

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleCalendarEntry('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleCalendarEntry('Deleted', event);
      },
    },
  ];

  refresh = new Subject<void>();

  events: CalendarEvent[] = [];
  
  async ionViewWillEnter(){
    this.extractedData = await this._route.snapshot.data["scheduleData"];
    this.isTeacher = await this._user.isTeacher();
    this.isAdmin = await this._user.isAdmin();

    this.extractedData.forEach((e:DocumentData) => {
      this.events.push({title : e['title'],start : dayjs(e['eventDate']).toDate(), actions : this.actions, allDay:false })
    })

    setTimeout(() => {
      this.refresh.next();
    }, 200);
  }
  
  // events: CalendarEvent[] = [
  //   {
  //     start: subDays(startOfDay(new Date()), 1),
  //     end: addDays(new Date(), 1),
  //     title: 'A 3 day event',
  //     color: { ...colors['red'] },
  //     actions: this.actions,
  //     allDay: true,
  //     resizable: {
  //       beforeStart: true,
  //       afterEnd: true,
  //     },
  //     draggable: true,
  //   },
  //   {
  //     start: startOfDay(new Date()),
  //     title: 'An event with no end date',
  //     color: { ...colors['yellow'] },
  //     actions: this.actions,
  //   },
  //   {
  //     start: subDays(endOfMonth(new Date()), 3),
  //     end: addDays(endOfMonth(new Date()), 3),
  //     title: 'A long event that spans 2 months',
  //     color: { ...colors['blue'] },
  //     allDay: true,
  //   },
  //   {
  //     start: addHours(startOfDay(new Date()), 2),
  //     end: addHours(new Date(), 2),
  //     title: 'A draggable and resizable event',
  //     color: { ...colors['yellow'] },
  //     actions: this.actions,
  //     resizable: {
  //       beforeStart: true,
  //       afterEnd: true,
  //     },
  //     draggable: true,
  //   },
  // ];

  activeDayIsOpen: boolean = true;

  // constructor(private modal: NgbModal) {}

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    console.log("Event time changed event");
    
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleCalendarEntry('Dropped or resized', event);
  }

  private modalCtrl!: ModalController;
  
  async handleCalendarEntry(action: string, event: CalendarEvent) {
    console.log("Calendar entry selected",event);
    console.log("trigger : ",this.studentModal.trigger);
    console.log("modal : ",this.studentModal);
    this.studentModal.trigger = "studentModal";
    // this.studentModal
    const modal = this.studentModal.present();
    // modal.present();
    // this.modal.open(this.modalContent, { size: 'lg' });
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  myclick($event:any){
    this.clickedDate = dayjs($event.day.date).add(13,'hour');
    this.newEvent.time = this.clickedDate.toISOString();
  }
  
  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.newEvent, 'confirm');
    console.log("new event : ",this.newEvent);
    
    if(!this._user.isTeacher() || !this._user.isAdmin()){
      console.log("User doesn't have the rights to create an event");
      return
    }
    
    this._db.createCalendarEntry(this.newEvent);

    this.refresh.next();
  }

  message !: string;
  
  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;
    }
  }

  updateTime($event:any){
    console.log("target value ",$event.target.value);

    this.newEvent.time = dayjs($event.target.value).toISOString();
    // this.newEvent.time = $event.target.value;
  }

  creatingEvent($event:any){
    console.log("clicked date : ",this.clickedDate);
    console.log("new event time : ",this.newEvent.time);
  }

}
