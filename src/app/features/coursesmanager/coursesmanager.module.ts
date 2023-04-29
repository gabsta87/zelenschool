import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginpageComponent } from './components/account/loginpage/loginpage.component';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from './components/navbar/navbar.component';
import { GallerypageComponent } from './components/gallerypage/gallerypage.component';
import { SwiperModule } from 'swiper/angular';
import { AboutpageComponent } from './components/aboutpage/aboutpage.component';
import { SchedulepageComponent } from './components/schedule/schedulepage/schedulepage.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FlatpickrModule } from 'angularx-flatpickr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { StorageService } from 'src/app/shared/service/storage.service';
import { AdminpageComponent } from './components/admin/adminpage/adminpage.component';
import { AdminpageGuard } from './guards/adminpage.guard';
import { AdminpageresolveResolver } from './resolvers/adminpageresolve.resolver';
import { AccountpageComponent } from './components/account/accountpage/accountpage.component';
import { UserpageResolver } from './resolvers/userpage.resolver';
import { UserLoggedGuard } from './guards/user-logged.guard';
import { CreateAccountComponent } from './components/account/create-account/create-account.component';
import { AccountteacherpageComponent } from './components/account/accountteacherpage/accountteacherpage.component';
import { CreateAccountTeacherComponent } from './components/account/create-account-teacher/create-account-teacher.component';
import { AccountadminpageComponent } from './components/account/accountadminpage/accountadminpage.component';
import { StudentModalComponent } from './components/schedule/student-modal/student-modal.component';
import { TeacherModalComponent } from './components/schedule/teacher-modal/teacher-modal.component';
import { CalendareventsresolveResolver } from './resolvers/calendareventsresolve.resolver';
import { TeacherCreateEventModalComponent } from './components/schedule/teacher-create-event-modal/teacher-create-event-modal.component';
import * as dayjs from 'dayjs';
import { ChoiceModalComponent } from './components/account/choice-modal/choice-modal.component';
import { BanmodalComponent } from './components/admin/banmodal/banmodal.component';
import { HttpClientModule } from '@angular/common/http';
import { AboutPageResolver } from './resolvers/about-page.resolver';
import { NewAssoMemberModalComponent } from './components/admin/new-asso-member-modal/new-asso-member-modal.component';
import { GalleryNameModalComponent } from './components/admin/gallery-name-modal/gallery-name-modal.component';
import { ModalWorkingHoursComponent } from './components/admin/modal-working-hours/modal-working-hours.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';



@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  declarations: [
    HeaderComponent,
    FooterComponent,
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
    BanmodalComponent,
    NewAssoMemberModalComponent,
    GalleryNameModalComponent,
    ModalWorkingHoursComponent,
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
      // provide : CustomDateFormatter,
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
            aboutData:AboutPageResolver
          }
        },{
          path:"schedule",
          component:SchedulepageComponent,
          resolve:{
            scheduleData:CalendareventsresolveResolver
          }
        },{
          path:"gallery",
          component:GallerypageComponent
        },{
          path:"create",
          component:CreateAccountComponent
        },{
          path:"createTeacher",
          component:CreateAccountTeacherComponent
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
            adminData:AdminpageresolveResolver
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
    { provide:"MyStorageService", useClass:StorageService },
    { provide: 'dayjs', useValue: dayjs },
    // { provide: "CalendarDateFormatter", useClass: CustomDateFormatter}
  ]
})
export class CoursesmanagerModule { }
