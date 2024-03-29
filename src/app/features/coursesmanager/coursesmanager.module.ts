import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FlatpickrModule } from 'angularx-flatpickr';
import * as dayjs from 'dayjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { StorageService } from 'src/app/shared/service/storage.service';
import { SwiperModule } from 'swiper/angular';
import { AboutpageComponent } from './components/presentation/aboutpage/aboutpage.component';
import { AccountadminpageComponent } from './components/account/accountadminpage/accountadminpage.component';
import { AccountpageComponent } from './components/account/accountpage/accountpage.component';
import { AccountteacherpageComponent } from './components/account/accountteacherpage/accountteacherpage.component';
import { BirthdayFieldComponent } from './components/account/birthday-field/birthday-field.component';
import { ChildCreationModalComponent } from './components/account/child-creation-modal/child-creation-modal.component';
import { ChoiceModalComponent } from './components/account/choice-modal/choice-modal.component';
import { CompleteAccountModalComponent } from './components/account/complete-account-modal/complete-account-modal.component';
import { CreateAccountTeacherComponent } from './components/account/create-account-teacher/create-account-teacher.component';
import { CreateAccountComponent } from './components/account/create-account/create-account.component';
import { LoginpageComponent } from './components/account/loginpage/loginpage.component';
import { AdminpageComponent } from './components/admin/adminpage/adminpage.component';
import { BanModalComponent } from './components/admin/ban-modal/ban-modal.component';
import { GalleryNameModalComponent } from './components/admin/gallery-name-modal/gallery-name-modal.component';
import { ModalWorkingHoursComponent } from './components/admin/modal-working-hours/modal-working-hours.component';
import { NewAssoMemberModalComponent } from './components/admin/new-asso-member-modal/new-asso-member-modal.component';
import { GallerypageComponent } from './components/gallerypage/gallerypage.component';
import { HeaderComponent } from './components/header/header.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SchedulepageComponent } from './components/schedule/schedulepage/schedulepage.component';
import { StudentModalComponent } from './components/schedule/student-modal/student-modal.component';
import { TeacherCreateEventModalComponent } from './components/schedule/teacher-create-event-modal/teacher-create-event-modal.component';
import { TeacherModalComponent } from './components/schedule/teacher-modal/teacher-modal.component';
import { AdminpageGuard } from './guards/adminpage.guard';
import { UserLoggedGuard } from './guards/user-logged.guard';
import { AboutPageResolver } from './resolvers/about-page.resolver';
import { AdminpageresolveResolver } from './resolvers/adminpageresolve.resolver';
import { CalendareventsresolveResolver } from './resolvers/calendareventsresolve.resolver';
import { UserpageResolver } from './resolvers/userpage.resolver';
import { CentersResolver } from './resolvers/centers.resolver';
import { AssoCenterModalComponent } from './components/admin/asso-center-modal/asso-center-modal.component';
import { NewRoomModalComponent } from './components/admin/new-room-modal/new-room-modal.component';
import { CenterOpeningHourModalComponent } from './components/admin/center-opening-hour-modal/center-opening-hour-modal.component';
import { PartnerModalComponent } from './components/admin/partner-modal/partner-modal.component';
import { CentersPageComponent } from './components/presentation/centers-page/centers-page.component';
import { AssoCenterService } from 'src/app/shared/service/db-access/asso-center.service';
import { ProjectsPageComponent } from './components/presentation/projects-page/projects-page.component';
import { assoProjectsResolver } from './resolvers/asso-projects.resolver';
import { EventModalComponent } from './components/admin/event-modal/event-modal.component';
import { ProjectModalComponent } from './components/admin/project-modal/project-modal.component';
import { assoEventsResolver } from './resolvers/asso-events.resolver';
import { assoEventsSnapshotResolver } from './resolvers/asso-events-snapshot.resolver';
import { AssoEventPopoverComponent } from './components/presentation/asso-event-popover/asso-event-popover.component';
import { GalleryResolver } from './resolvers/gallery.resolver';
import { DayInputComponent } from './components/common/day-input/day-input.component';
import { ImageInputComponent } from './components/common/image-input/image-input.component';



@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  declarations: [
    HeaderComponent,
    LoginpageComponent,
    NavbarComponent,
    GallerypageComponent,
    AboutpageComponent,
    SchedulepageComponent,
    AdminpageComponent,
    AccountpageComponent,
    CreateAccountComponent,
    AccountteacherpageComponent,
    CreateAccountTeacherComponent,
    AccountadminpageComponent,
    StudentModalComponent,
    TeacherModalComponent,
    TeacherCreateEventModalComponent,
    ChoiceModalComponent,
    BanModalComponent,
    NewAssoMemberModalComponent,
    GalleryNameModalComponent,
    ModalWorkingHoursComponent,
    ChildCreationModalComponent,
    CompleteAccountModalComponent,
    BirthdayFieldComponent,
    AssoCenterModalComponent,
    NewRoomModalComponent,
    CenterOpeningHourModalComponent,
    PartnerModalComponent,
    CentersPageComponent,
    ProjectsPageComponent,
    EventModalComponent,
    ProjectModalComponent,
    AssoEventPopoverComponent,
    DayInputComponent,
    ImageInputComponent,
  ],
  imports: [
    SwiperModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    IonicModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory : adapterFactory,
    }),
    RouterModule.forChild(
      [{path:'',
      component:HeaderComponent, 
      children:[
        {
          path:"login",
          component:LoginpageComponent
        },{
          path:"about",
          component:AboutpageComponent,
          resolve:{
            aboutData:AboutPageResolver,
            assoEvents:assoEventsSnapshotResolver
          }
        },{
          path:"schedule",
          component:SchedulepageComponent,
          resolve:{
            scheduleData:CalendareventsresolveResolver,
            assoCenters:CentersResolver
          }
        },{
          path:"gallery",
          component:GallerypageComponent,
          resolve:{
            galleries:GalleryResolver
          }
        },{
          path:"create",
          component:CreateAccountComponent
        },{
          path:"createTeacher",
          component:CreateAccountTeacherComponent
        },{
          path:"centersPage",
          component:CentersPageComponent,
          resolve:{
            assoCenters : CentersResolver
          }
        },{
          path:"account",
          component:AccountpageComponent,
          canActivate:[UserLoggedGuard],
          resolve:{
            userData:UserpageResolver
          }
        },{
          path:"accountAdmin",
          component:AccountadminpageComponent,
          canActivate:[UserLoggedGuard,AdminpageGuard],
          resolve:{
            userData:UserpageResolver
          }
        },{
          path:"accountTeacher",
          component:AccountteacherpageComponent,
          canActivate:[UserLoggedGuard],
          resolve:{
            userData:UserpageResolver
          }
        },{
          path:"admin",
          component:AdminpageComponent,
          canActivate:[AdminpageGuard],
          resolve:{
            adminData:AdminpageresolveResolver,
            assoCenters:CentersResolver,
            assoProjects:assoProjectsResolver,
            assoEvents:assoEventsResolver
          }  
        },{
          path:"assoProjects",
          component:ProjectsPageComponent,
          resolve:{
            assoProjects:assoProjectsResolver,
          }  
        },{
          path:"",
          redirectTo:"/about",
          pathMatch:"full",
        },{ 
          path: '**', 
          redirectTo: "/about",
          pathMatch:"full",
        }
      ]}]
    )
  ],
  providers:[
    { provide:"MyDatabaseService", useClass:AngularfireService },
    { provide:"AssoDatabaseService", useClass:AssoCenterService },
    { provide:"MyStorageService", useClass:StorageService },
    { provide: 'dayjs', useValue: dayjs },
  ]
})
export class CoursesmanagerModule{ }
