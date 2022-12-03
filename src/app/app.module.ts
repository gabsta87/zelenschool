import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './features/coursesmanager/components/homepage/homepage.component';
import { LoginpageComponent } from './features/coursesmanager/components/loginpage/loginpage.component';
import { HeaderComponent } from './features/coursesmanager/components/header/header.component';
import { FooterComponent } from './features/coursesmanager/components/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    LoginpageComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
