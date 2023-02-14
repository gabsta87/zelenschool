import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { isSameDay, isSameMonth } from 'date-fns';
import { WeekDay, MonthView, MonthViewDay } from 'calendar-utils';
import { BehaviorSubject, combineLatest, elementAt, firstValueFrom, map, Observable, Subject, switchMap } from 'rxjs';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView, } from 'angular-calendar';
import { EventColor } from 'calendar-utils';
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
  clickedDate: dayjs.Dayjs = dayjs(this.viewDate);
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
    // this.extractedData = this._route.snapshot.data["scheduleData"];
    this.extractedData = this._db.getCalendarEntries();
  }

  async ngOnInit(){
    this.extractedData.subscribe((newValues) => {
      this.events = [];
      newValues.forEach(async e =>{
        
        let user = await this._db.getUser(e['author']);
        let tempAttendants:any[] = [];

        e['attendantsId'].forEach(async (e:string) =>
          this._db.getUser(e).then(e => tempAttendants.push(e))
        )
        
        this.events.push({
          title : e['title'],
          start : dayjs(e['eventDate']).toDate(), 
          actions : this.actions, 
          allDay:false,
          meta:{
            id : e['id'],
            time : e['eventDate'],
            authorId: e['author'],
            author : user,
            room_id: e['room_id'],
            attendantsId: e['attendantsId'],
            attendants : tempAttendants,
            max_participants: e['max_participants'],
          },
        })
        console.log("events : ",this.events);
      })
    })

    // setTimeout(() => {
    //   this.refresh.next();
    // }, 200);
  }

  async ionViewWillEnter(){
    setTimeout(() => {
      this.refresh.next();
    }, 200);
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


  async handleCalendarEntry(action: string, event: CalendarEvent) {
    
    console.log("event while creating modal : ",event);
    const modal = await this.modalController.create({
      component: this.isTeacher.value ? TeacherModalComponent: StudentModalComponent,
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
  
  async creatingEvent($event:any){
    console.log("clicked date : ",this.clickedDate);
    console.log("new event time : ",this.newEvent.time);
    const modal = await this.modalController.create({
      component: this.isTeacher.value ? TeacherCreateEventModalComponent: null,
      componentProps: {
        time: this.newEvent.time,
      },
    });
    
    modal.present();
  }

}
