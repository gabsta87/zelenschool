import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginpageComponent } from './components/loginpage/loginpage.component';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from './components/navbar/navbar.component';
import { GallerypageComponent } from './components/gallerypage/gallerypage.component';
import { SwiperModule } from 'swiper/angular';
import { PartnerspageComponent } from './components/partnerspage/partnerspage.component';
import { AboutpageComponent } from './components/aboutpage/aboutpage.component';
import { SchedulepageComponent } from './components/schedulepage/schedulepage.component';
import { ContactpageComponent } from './components/contactpage/contactpage.component';
import { DonatepageComponent } from './components/donatepage/donatepage.component';
import { EditnewsComponent } from './components/editnews/editnews.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FlatpickrModule } from 'angularx-flatpickr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { StorageService } from 'src/app/shared/service/storage.service';
import { AdminpageComponent } from './components/adminpage/adminpage.component';
import { AdminpageGuard } from './guards/adminpage.guard';
import { AdminpageresolveResolver } from './resolvers/adminpageresolve.resolver';
import { AccountpageComponent } from './components/accountpage/accountpage.component';
import { UserpageResolver } from './resolvers/userpage.resolver';
import { UserLoggedGuard } from './guards/user-logged.guard';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { AccountteacherpageComponent } from './components/accountteacherpage/accountteacherpage.component';
import { CreateAccountTeacherComponent } from './components/create-account-teacher/create-account-teacher.component';
import { AccountadminpageComponent } from './components/accountadminpage/accountadminpage.component';
import { StudentModalComponent } from './components/student-modal/student-modal.component';
import { TeacherModalComponent } from './components/teacher-modal/teacher-modal.component';
import { CalendareventsresolveResolver } from './resolvers/calendareventsresolve.resolver';
import { TeacherCreateEventModalComponent } from './components/teacher-create-event-modal/teacher-create-event-modal.component';
import * as dayjs from 'dayjs';
import { ChoiceModalComponent } from './components/choice-modal/choice-modal.component';
import { BanmodalComponent } from './components/banmodal/banmodal.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { HttpClientModule } from '@angular/common/http';
import { ActivitiespageComponent } from './components/activitiespage/activitiespage.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    LoginpageComponent,
    NavbarComponent,
    GallerypageComponent,
    PartnerspageComponent,
    AboutpageComponent,
    SchedulepageComponent,
    ContactpageComponent,
    DonatepageComponent,
    ImageUploadComponent,
    EditnewsComponent,
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
    ActivitiespageComponent,
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
      useFactory: adapterFactory,
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
          component:AboutpageComponent
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
          path:"contact",
          component:ContactpageComponent
        },{
          path:"partners",
          component:PartnerspageComponent
        },{
          path:"donate",
          component:DonatepageComponent
        },{
          path:"activities",
          component:ActivitiespageComponent
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
          path:"imageUpload",
          component:ImageUploadComponent,
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
          redirectTo: "/about"
        }
      ]}]  
    )
  ],
  providers:[
    { provide:"MyDatabaseService", useClass:AngularfireService },
    { provide:"MyStorageService", useClass:StorageService },
    { provide: 'dayjs', useValue: dayjs }
  ]
})
export class CoursesmanagerModule { }
