import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomepageComponent } from './components/homepage/homepage.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginpageComponent } from './components/loginpage/loginpage.component';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from './components/navbar/navbar.component';
import { GallerypageComponent } from './components/gallerypage/gallerypage.component';
import { SwiperModule } from 'swiper/angular';
import { NewspageComponent } from './components/newspage/newspage.component';
import { PartnerspageComponent } from './components/partnerspage/partnerspage.component';
import { AboutpageComponent } from './components/aboutpage/aboutpage.component';
import { SchedulepageComponent } from './components/schedulepage/schedulepage.component';
import { ContactpageComponent } from './components/contactpage/contactpage.component';
import { DonatepageComponent } from './components/donatepage/donatepage.component';
import { EditnewsComponent } from './components/editnews/editnews.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FlatpickrModule } from 'angularx-flatpickr';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    HomepageComponent,
    HeaderComponent,
    FooterComponent,
    LoginpageComponent,
    NavbarComponent,
    GallerypageComponent,
    NewspageComponent,
    PartnerspageComponent,
    AboutpageComponent,
    SchedulepageComponent,
    ContactpageComponent,
    DonatepageComponent,
    EditnewsComponent
  ],
  imports: [
    SwiperModule,
    CommonModule,
    FormsModule,
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
          path:"homepage",
          component:HomepageComponent
        },{
          path:"login",
          component:LoginpageComponent
        },{
          path:"news",
          component:NewspageComponent
        },{
          path:"about",
          component:AboutpageComponent
        },{
          path:"schedule",
          component:SchedulepageComponent
        },{
          path:"gallery",
          component:GallerypageComponent
        },{
          redirectTo:"/homepage",
          path:"",
          pathMatch:"full",
        }
      ]}]  
    )
  ]
})
export class CoursesmanagerModule { }
