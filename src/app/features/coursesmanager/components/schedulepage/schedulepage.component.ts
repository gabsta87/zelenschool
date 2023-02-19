import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { isSameDay, isSameMonth } from 'date-fns';
import { WeekDay, MonthView, MonthViewDay } from 'calendar-utils';
import { BehaviorSubject, combineLatest, elementAt, firstValueFrom, map, Observable, Subject, switchMap } from 'rxjs';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarMonthViewDay, CalendarView, CalendarWeekViewBeforeRenderEvent, } from 'angular-calendar';
import { EventColor,WeekViewHour, WeekViewHourColumn } from 'calendar-utils';
import * as dayjs from 'dayjs';
import { DocumentData } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { IonModal, ModalController } from '@ionic/angular';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';
import { StudentModalComponent } from '../student-modal/student-modal.component';
import { TeacherModalComponent } from '../teacher-modal/teacher-modal.component';
import { TeacherCreateEventModalComponent } from '../teacher-create-event-modal/teacher-create-event-modal.component';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

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
  
  // Schedulepage
  adjustedDate: dayjs.Dayjs = dayjs(this.viewDate);
  isTeacher:BehaviorSubject<boolean> = this._user.isLoggedAsTeacher;
  isAdmin:BehaviorSubject<boolean> = this._user.isLoggedAsAdmin;
  newEvent:{title:string,time:string,room:number,max_participants:number} = {title:"",time:"",room:-1,max_participants:0};
  extractedData!:Observable<DocumentData[]>;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _db: AngularfireService,
    private readonly _user: UsermanagementService,
    private readonly modalController: ModalController
    ) {
    this.extractedData = this._route.snapshot.data["scheduleData"];
  }

  async ngOnInit(){
    this.extractedData.subscribe((newValues) => {
      this.events = [];
      newValues.forEach(async e =>{
        console.log();
        
        this.events.push({
          title : e['title'],
          start : dayjs(e['eventDate']).toDate(), 
          actions : this.actions, 
          allDay:false,
          meta:{
            id : e['id'],
            time : e['eventDate'],
            author: e['author'],
            room_id: e['room_id'],
            attendantsId: e['attendantsId'],
            max_participants: e['max_participants'],
          },
        })
      })
    });
  }

  async createEvent(){
    if (!(this.isTeacher.value || this.isAdmin.value)){
      console.log("Cannot create if not admin or not teacher");
      return
    }
    
    const modal = await this.modalController.create({
      component:  TeacherCreateEventModalComponent,
      componentProps: {
        time: this.adjustedDate.toISOString()
      },
    });
    modal.present();
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

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  selectedMonthViewDay!: CalendarMonthViewDay;
  selectedDayViewDate!: Date;
  hourColumns!: WeekViewHourColumn[];
  selectedDays: any = [];

  // dayClicked({ date, events }: { date: CalendarMonthViewDay; events: CalendarEvent[] }): void {
  dayClicked( cmwDay: CalendarMonthViewDay): void {
    console.log("date : ",cmwDay);
    let date = cmwDay.date;
    this.adjustedDate = dayjs(cmwDay.date).add(13,'hour');
    this.newEvent.time = this.adjustedDate.toISOString();

    // // FIND A WAY TO GIVE EVENTS
    // if (isSameMonth(date, this.viewDate)) {
    //   if (
    //     (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
    //     events.length === 0
    //   ) {
    //     this.activeDayIsOpen = false;
    //   } else {
    //     this.activeDayIsOpen = true;
    //   }
    //   this.viewDate = date;
    // }


    this.selectedMonthViewDay = cmwDay;

    const selectedDateTime = this.selectedMonthViewDay.date.getTime();
    const dateIndex = this.selectedDays.findIndex(
      (selectedDay:any) => selectedDay.date.getTime() === selectedDateTime
    );
    
    if (dateIndex > -1) {
      delete this.selectedMonthViewDay.cssClass;
      this.selectedDays.splice(dateIndex, 1);
    } else {
      this.selectedDays.push(this.selectedMonthViewDay);
      cmwDay.cssClass = 'cal-day-selected';
      this.selectedMonthViewDay = cmwDay;
    }
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach((day) => {
      if (
        this.selectedDays.some(
          (selectedDay:any) => selectedDay.date.getTime() === day.date.getTime()
        )
      ) {
        day.cssClass = 'cal-day-selected';
      }
    });
  }

  hourSegmentClicked(date: Date) {
    this.selectedDayViewDate = date;
    this.addSelectedDayViewClass();
  }

  beforeWeekOrDayViewRender(event: CalendarWeekViewBeforeRenderEvent) {
    this.hourColumns = event.hourColumns;
    this.addSelectedDayViewClass();
  }

  private addSelectedDayViewClass() {
    this.hourColumns.forEach((column) => {
      column.hours.forEach((hourSegment) => {
        hourSegment.segments.forEach((segment) => {
          delete segment.cssClass;
          if (
            this.selectedDayViewDate &&
            segment.date.getTime() === this.selectedDayViewDate.getTime()
          ) {
            segment.cssClass = 'cal-day-selected';
          }
        });
      });
    });
  }

}
