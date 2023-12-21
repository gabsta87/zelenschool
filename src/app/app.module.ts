import { InjectionToken, NgModule, Optional } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import localeFr from '@angular/common/locales/fr';
import localeRu from '@angular/common/locales/ru';
import { registerLocaleData } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicModule } from '@ionic/angular';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
// import { provideFirebaseApp } from '@angular/fire/app';
// import { initializeApp } from 'firebase-admin/app';
import { app } from 'firebase-admin';
export const FIREBASE_ADMIN = new InjectionToken<app.App>('firebase-admin');
import { initializeAppCheck, provideAppCheck, ReCaptchaV3Provider, CustomProvider } from '@angular/fire/app-check';

registerLocaleData(localeFr);
registerLocaleData(localeRu);

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    IonicModule.forRoot(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    // provideFirebaseApp(() => initializeApp()),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    // RouterModule.forRoot([],routerOptions)
    // provideAppCheck((injector) =>  {
    //   const admin = injector.get<app.App|null>(FIREBASE_ADMIN, null);
    //     const provider = new CustomProvider({ getToken: () =>
    //       admin.
    //       appCheck().
    //       createToken(environment.firebaseConfig.appId, { ttlMillis: 604_800_000, /* 1 week */ }).
    //       then(({ token, ttlMillis: expireTimeMillis }) => ({ token, expireTimeMillis } ))
    //     });
    //     return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: false });
    //   }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
