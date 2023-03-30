import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { compareAsc, isSameDay, isSameMonth } from 'date-fns';
import { WeekDay, MonthView, MonthViewDay } from 'calendar-utils';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarNativeDateFormatter, CalendarView, DateFormatterParams, DAYS_OF_WEEK, } from 'angular-calendar';
import { EventColor } from 'calendar-utils';
import * as dayjs from 'dayjs';
import { DocumentData } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { IonModal, ModalController } from '@ionic/angular';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';
import { StudentModalComponent } from '../student-modal/student-modal.component';
import { TeacherModalComponent } from '../teacher-modal/teacher-modal.component';
import { TeacherCreateEventModalComponent } from '../teacher-create-event-modal/teacher-create-event-modal.component';

import * as utc from 'dayjs/plugin/utc';
import { formatTime } from 'src/app/shared/service/hour-management.service';

dayjs.extend(utc)

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
 
  // Angular Calendar
  refresh = new Subject<void>();
  events: CalendarEvent[] = [];
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  activeDayIsOpen: boolean = false;
  viewDate: Date = new Date();
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

  // Schedulepage
  adjustedDate: dayjs.Dayjs = dayjs(this.viewDate);
  isTeacher:BehaviorSubject<boolean> = this._user.isLoggedAsTeacher;
  isAdmin:BehaviorSubject<boolean> = this._user.isLoggedAsAdmin;
  isBanned = this._user.isUserBanned;
  newEvent:{title:string,time:string,room:number,max_participants:number} = {title:"",time:"",room:-1,max_participants:0};
  extractedData!:Observable<DocumentData[]>;
  filterAscTitle = true;
  filterAscTime = true;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _user: UsermanagementService,
    private readonly modalController: ModalController
    ) {
    this.extractedData = this._route.snapshot.data["scheduleData"];
  }

  async ngOnInit(){
    this.extractedData.subscribe((newValues) => {
      this.events = [];
      newValues.forEach(async e =>{
        this.events.push({
          title : e['title'],
          start : new Date(e['timeStart']),
          end : new Date(e['timeEnd']),
          actions : this.actions, 
          allDay:false,
          meta:{
            id : e['id'],
            timeStart : formatTime(e['timeStart']),
            timeEnd : formatTime(e['timeEnd']),
            author: e['author'],
            room_id: e['room_id'],
            attendantsId: e['attendantsId'],
            max_participants: e['max_participants'],
            description: e['description'],
          },
        })
      })
    });
  }

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        console.log('Edit event', event);
        // this.handleCalendarEntry('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        console.log('Delete event', event);
        //     this.events = this.events.filter((iEvent) => iEvent !== event);
        //     this.handleCalendarEntry('Deleted', event);
      },
    },
  ];

  async handleCalendarEntry(action: string, event: CalendarEvent) {
    const modal = await this.modalController.create({
      component: (this.isTeacher.value || this.isAdmin.value )? TeacherModalComponent: StudentModalComponent,
      componentProps: {
        meta: event.meta,
        title: event.title,
      },
    });
    
    modal.present();
  }

  async handleEvent(event:DocumentData){
    const result = this.events.find((e)=> e.meta.id == event['id']);
    if(result == undefined)
      return

    this.handleCalendarEntry("Clicked",result);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {

    this.adjustedDate = dayjs(date).add(13,'hour');
    this.newEvent.time = formatTime(this.adjustedDate);

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

  async createEvent(){
    if (!(this.isTeacher.value || this.isAdmin.value)){
      console.log("Cannot create if not admin or not teacher");
      return
    }

    if(this._user.isUserBanned.value){
      console.log("Banned teacher cannot create a course");
      return
    }

    console.log("adjusted date : ",formatTime(this.adjustedDate));
    console.log("time end : ",formatTime(dayjs(this.adjustedDate).add(1,'hour').local().toString()));
    
    
    const modal = await this.modalController.create({
      component:  TeacherCreateEventModalComponent,
      componentProps: {
        timeStart: this.adjustedDate.local().format(),
        timeEnd: dayjs(this.adjustedDate).add(1,'hour').local().format(),
      },
    });
    modal.present();
  }

  sortByTitle(){
    let result;
    if(this.filterAscTitle)
      result = this.extractedData.pipe(map((e:any)=> [...e].sort( (a,b) => a['title'].toLowerCase() > b['title'].toLowerCase() ? 1 : -1)))
    else
      result = this.extractedData.pipe(map((e:any)=> [...e].sort( (a,b) => a['title'].toLowerCase() < b['title'].toLowerCase() ? 1 : -1)))
      
    this.extractedData = result;
    this.filterAscTitle = !this.filterAscTitle;
    this.filterAscTime = true;
  }

  sortByTime(){
    let result;
    if(this.filterAscTime){
      result = this.extractedData.pipe(map((e:any)=> [...e].sort( (a,b) => dayjs(a['timeStart']).utc().isAfter(dayjs(b['timeStart']).utc(),"minute") ? 1 : -1 )))
    }else{
      result = this.extractedData.pipe(map((e:any)=> [...e].sort( (a,b) => dayjs(a['timeStart']).utc().isBefore(dayjs(b['timeStart']).utc(),"minute") ? 1 : -1)))
    }
      
    this.extractedData = result;
    this.filterAscTime = !this.filterAscTime;
    this.filterAscTitle = true;
  }
}
