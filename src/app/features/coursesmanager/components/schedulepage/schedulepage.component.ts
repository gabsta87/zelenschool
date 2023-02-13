import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, Output, EventEmitter, } from '@angular/core';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours, } from 'date-fns';
import { WeekDay, MonthView, MonthViewDay, ViewPeriod, } from 'calendar-utils';
import { BehaviorSubject, elementAt, firstValueFrom, map, Observable, Subject, switchMap } from 'rxjs';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView, } from 'angular-calendar';
import { EventColor } from 'calendar-utils';
import * as dayjs from 'dayjs';
import { DocumentData } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { IonModal, ModalController } from '@ionic/angular';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';
import { StudentModalComponent } from '../student-modal/student-modal.component';
import { TeacherModalComponent } from '../teacher-modal/teacher-modal.component';


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
  @ViewChild(IonModal) studentModal!: IonModal;
  
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  clickedDate: dayjs.Dayjs = dayjs(this.viewDate);
  isTeacher:BehaviorSubject<boolean> = this._user.isLoggedAsTeacher;
  isAdmin:BehaviorSubject<boolean> = this._user.isLoggedAsAdmin;

  newEvent:{title:string,time:string,room:number,max_participants:number} = {title:"",time:"",room:-1,max_participants:0};

  // extractedData:Observable<any> = this._route.snapshot.data["scheduleData"];
  extractedData!:DocumentData[];

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _user: UsermanagementService,
    private readonly modalController: ModalController
    ) {
      this.extractedData = this._route.snapshot.data["scheduleData"];
      
      let elem = this.events as any;
      console.log("extracted data before init : ",this.extractedData);
      
      
      this.extractedData.forEach((e:DocumentData) => {
        elem.push({
          id : e['id'],
          title : e['title'],
          authorId: e['author'],
          author: e['author_full'],
          room: e['roomId'],
          start : dayjs(e['eventDate']).toDate(), 
          actions : this.actions, 
          allDay:false })
      });
      console.log("extracted data after init: ",this.extractedData);
      console.log("events after : ",this.events);
      
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
      },
    },
    // {
    //   label: '<i class="fas fa-fw fa-trash-alt"></i>',
    //   a11yLabel: 'Delete',
    //   onClick: ({ event }: { event: CalendarEvent }): void => {
    //     this.events = this.events.filter((iEvent) => iEvent !== event);
    //     this.handleCalendarEntry('Deleted', event);
    //   },
    // },
  ];

  refresh = new Subject<void>();

  events: CalendarEvent[] = [];
  
  async ionViewWillEnter(){
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
  // ];

  activeDayIsOpen: boolean = false;

  eventTimesChanged({ event, newStart, newEnd, }: CalendarEventTimesChangedEvent): void {
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

  async handleCalendarEntry(action: string, event: CalendarEvent) {
    
    console.log("event while creating modal : ",event);
    const modal = await this.modalController.create({
      component: this.isTeacher.value ? TeacherModalComponent: StudentModalComponent,
      componentProps: {
        author: (event as any).author_full,
        id: (event as any).id,
        title: (event as any).title,
      },
    });
    console.log("is teacher : ",this.isTeacher.value);
    
    console.log("component : ",modal.component);
    
    modal.present();
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {

    this.clickedDate = dayjs(date).add(13,'hour');
    this.newEvent.time = this.clickedDate.toISOString();

    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }
  
  updateTime($event:any){
    this.newEvent.time = dayjs($event.target.value).toISOString();
    // this.newEvent.time = $event.target.value;
  }

  creatingEvent($event:any){
    console.log("clicked date : ",this.clickedDate);
    console.log("new event time : ",this.newEvent.time);
  }

}
