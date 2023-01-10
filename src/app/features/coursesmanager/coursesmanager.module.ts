import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomepageComponent } from './components/homepage/homepage.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginpageComponent } from './components/loginpage/loginpage.component';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ContainerpageComponent } from './components/containerpage/containerpage.component';
import { GallerypageComponent } from './components/gallerypage/gallerypage.component';
import { SwiperModule } from 'swiper/angular';
import { NewspageComponent } from './components/newspage/newspage.component';
import { PartnerspageComponent } from './components/partnerspage/partnerspage.component';
import { AboutpageComponent } from './components/aboutpage/aboutpage.component';
import { SchedulepageComponent } from './components/schedulepage/schedulepage.component';
import { ContactpageComponent } from './components/contactpage/contactpage.component';
import { DonatepageComponent } from './components/donatepage/donatepage.component';

@NgModule({
  declarations: [
    HomepageComponent,
    HeaderComponent,
    FooterComponent,
    LoginpageComponent,
    NavbarComponent,
    ContainerpageComponent,
    GallerypageComponent,
    NewspageComponent,
    PartnerspageComponent,
    AboutpageComponent,
    SchedulepageComponent,
    ContactpageComponent,
    DonatepageComponent
  ],
  imports: [
    SwiperModule,
    CommonModule,
    IonicModule,
    RouterModule.forChild(
      [{path:'',
      component:ContainerpageComponent,
      children:[
        {
          path:"homepage",
          component:HomepageComponent
        },{
          path:"login",
          component:LoginpageComponent
        },{
          path:"main",
          component:ContainerpageComponent
        },{
          path:"gallery",
          component:GallerypageComponent
        },{
          redirectTo:"/main",
          path:"",
          pathMatch:"full",
        }
      ]}]  
    )
  ]
})
export class CoursesmanagerModule { }
