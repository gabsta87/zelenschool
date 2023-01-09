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


@NgModule({
  declarations: [
    HomepageComponent,
    HeaderComponent,
    FooterComponent,
    LoginpageComponent,
    NavbarComponent,
    ContainerpageComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(
      [{path:'',
      component:HomepageComponent,
      children:[
        {
          path:"homepage",
          component:HomepageComponent
        },{
          path:"loginpage",
          component:LoginpageComponent
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
