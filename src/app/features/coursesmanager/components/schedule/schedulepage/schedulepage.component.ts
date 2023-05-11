import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, ViewChild } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { DocumentData } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { IonModal, ModalController } from '@ionic/angular';
import { CalendarDateFormatter, CalendarEvent, CalendarEventTimesChangedEvent, CalendarMonthViewDay, CalendarView, CalendarWeekViewBeforeRenderEvent, DAYS_OF_WEEK } from 'angular-calendar';
import { MonthViewDay, WeekViewHourColumn } from 'calendar-utils';
import { isSameDay, isSameMonth } from 'date-fns';
import dayjs from 'dayjs';
import { BehaviorSubject, Observable, Subject, map } from 'rxjs';
import { formatTime, getNowDate } from 'src/app/shared/service/hour-management.service';
import { LanguageManagerService } from 'src/app/shared/service/language-manager.service';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';
import { StudentModalComponent } from '../student-modal/student-modal.component';
import { TeacherCreateEventModalComponent } from '../teacher-create-event-modal/teacher-create-event-modal.component';
import { CustomDateFormatter } from './custom-date-formatter.provider';
import { TeacherModalComponent } from '../teacher-modal/teacher-modal.component';

export interface CalendarMonthViewEventTimesChangedEvent< EventMetaType = any, DayMetaType = any > 
  extends CalendarEventTimesChangedEvent<EventMetaType> { day: MonthViewDay<DayMetaType>; }

@Component({
  selector: 'app-schedulepage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedulepage.component.html',
  styleUrls: ['./schedulepage.component.scss'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
  ],
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
  selectedMonthViewDay!: CalendarMonthViewDay;
  selectedDayViewDate!: Date;
  hourColumns!: WeekViewHourColumn[];
  selectedDays: any = [];
  locale: string = this._lang.getCurrentCode();

  // Schedulepage
  isTeacher:BehaviorSubject<boolean> = this._user.isLoggedAsTeacher;
  isAdmin:BehaviorSubject<boolean> = this._user.isLoggedAsAdmin;
  isBanned:BehaviorSubject<boolean> = this._user.isUserBanned;
  isLogged:BehaviorSubject<boolean> = this._user.isLogged;
  extractedData :Observable<DocumentData[]> =  this._route.snapshot.data["scheduleData"];
  filterAscTitle = true;
  filterAscTime = true;
  now = getNowDate();
  coursesSubscribtion !: any;
  futureCourses !: Observable<DocumentData[]>;
  selectedDayRemove= new EventEmitter();
  selectedDaySubscribtion !: any;

  words$ = this._lang.currentLanguage$;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _user: UsermanagementService,
    private readonly modalController: ModalController,
    private cd: ChangeDetectorRef,
    private readonly _lang:LanguageManagerService,
    readonly auth : Auth,
    ) {
    this.futureCourses = this.extractedData.pipe(map( (courses:any) => courses = courses.filter((course:any) =>dayjs(course.timeStart).isAfter(dayjs(getNowDate()),"hour") )))
  }

  async ngOnInit(){
    this.coursesSubscribtion = this.extractedData.subscribe((newValues) => {
      this.events = [];
      newValues.forEach( e =>{
        this.events.push({
          title : e['title'],
          start : new Date(e['timeStart']),
          end : new Date(e['timeEnd']),
          // actions : this.actions, 
          allDay : false,
          meta : {
            id : e['id'],
            timeStart : formatTime(e['timeStart']),
            timeEnd : formatTime(e['timeEnd']),
            author: e['author'],
            room_id: e['room_id'],
            room : e['room'],
            attendantsId: e['attendantsId'],
            max_participants: e['max_participants'],
            description: e['description'],
          },
        })
      })
    });

    this.selectedDaySubscribtion = this.selectedDayRemove.subscribe(_=>{
      this.refresh.next();
    });

    this.words$.subscribe(_=>{
      this.locale = this._lang.getCurrentCode();
    });
  }

  ngOnDestroy(){
    this.coursesSubscribtion.unsubscribe();
    this.selectedDaySubscribtion.unsubscribe();
  }

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
    this.selectedDays = [];
    this.selectedDayViewDate = undefined as any;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  dayClicked(day:CalendarMonthViewDay): void {

    if (isSameMonth(day.date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, day.date) && this.activeDayIsOpen === true) ||
        day.events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = day.date;
    }

    if(dayjs(day.date).isBefore(dayjs(this.now).subtract(1,"day")))
      return;

    if(!this.isTeacher.value && !this.isAdmin.value)
      return;

    this.selectedMonthViewDay = day;
    const selectedDateTime = this.selectedMonthViewDay.date.getTime();
    const dateIndex = this.selectedDays.findIndex(
      (selectedDay:any) => selectedDay.date.getTime() === selectedDateTime
    );
    if (dateIndex > -1) {
      delete this.selectedMonthViewDay.cssClass;
      this.selectedDays.splice(dateIndex, 1);
    } else {
      this.selectedDays.push(this.selectedMonthViewDay);
      day.cssClass = 'cal-day-selected';
      this.selectedMonthViewDay = day;
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
    if(dayjs(date).isBefore(dayjs(this.now,"hour")))
      return;

    if(!this.isTeacher.value && !this.isAdmin.value)
      return;

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

  async createEvent(){
    if (!(this.isTeacher.value || this.isAdmin.value)){
      console.log("Cannot create if not admin or not teacher");
      return
    }

    if(this._user.isUserBanned.value){
      console.log("Banned teacher cannot create a course");
      return
    }

    if(this.selectedDays.length > 0){

      this.selectedDays = this.selectedDays.sort( (a:any,b:any) => dayjs(a['date']).utc().isAfter(dayjs(b['date']).utc(),"hour") ? 1 : -1 );
  
      const modal = await this.modalController.create({
        component:  TeacherCreateEventModalComponent,
        componentProps: {
          selectedDays : this.selectedDays,
          timeStart : dayjs(this.selectedDays[0].date.toString()).add(15,"hour").toISOString(),
          timeEnd : dayjs(this.selectedDays[0].date.toString()).add(16,"hour").toISOString(),
          dayRemoveEvent : this.selectedDayRemove,
        },
      });
      modal.present();
  
      const { role } = await modal.onWillDismiss();
  
      if(role === 'confirm'){
        this.selectedDays = [];
      }
    }else if(this.selectedDayViewDate){

      const modal = await this.modalController.create({
        component:  TeacherCreateEventModalComponent,
        componentProps: {
          selectedDays : [{date:this.selectedDayViewDate}],
          timeStart : dayjs(this.selectedDayViewDate.toString()),
          timeEnd : dayjs(this.selectedDayViewDate.toString()).add(1,"hour").toISOString(),
          dayRemoveEvent : this.selectedDayRemove,
        },
      });
      modal.present();
  
      const { role } = await modal.onWillDismiss();
  
      if(role === 'confirm'){
        this.selectedDayViewDate = undefined as any;
      }
    }

    this.cd.markForCheck();
  }

  sortCoursesByTitle(){
    let result;
    if(this.filterAscTitle)
      result = this.futureCourses.pipe(map((e:any)=> [...e].sort( (a,b) => a['title'].toLowerCase() > b['title'].toLowerCase() ? 1 : -1)))
    else
      result = this.futureCourses.pipe(map((e:any)=> [...e].sort( (a,b) => a['title'].toLowerCase() < b['title'].toLowerCase() ? 1 : -1)))
      
    this.futureCourses = result;
    this.filterAscTitle = !this.filterAscTitle;
    this.filterAscTime = true;
  }

  sortCoursesByTime(){
    let result;
    if(this.filterAscTime){
      result = this.futureCourses.pipe(map((e:any)=> [...e].sort( (a,b) => dayjs(a['timeStart']).utc().isAfter(dayjs(b['timeStart']).utc(),"minute") ? 1 : -1 )))
    }else{
      result = this.futureCourses.pipe(map((e:any)=> [...e].sort( (a,b) => dayjs(a['timeStart']).utc().isBefore(dayjs(b['timeStart']).utc(),"minute") ? 1 : -1)))
    }
      
    this.futureCourses = result;
    this.filterAscTime = !this.filterAscTime;
    this.filterAscTitle = true;
  }

}
