import { Injectable } from '@angular/core';
import languageData from '../../../assets/lang/data.json';
import { AngularfireService } from './angularfire.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageManagerService{

  currentLanguage$: BehaviorSubject<any> = new BehaviorSubject(null);
  currentLanguageFlag!: string;
  currentCode!: string;

  constructor(private readonly _db: AngularfireService) {
    this.loadUserLanguage()

    if (!this.currentLanguage$.value)
      this.changeLanguageTo("EN");
  }
  

  async loadUserLanguage() {
    let dbLanguage = await this._db.getCurrentUserLanguage();
    
    if (dbLanguage == undefined)
      dbLanguage = "EN";
    this.changeLanguageTo(dbLanguage);
  }

  getCurrentCode() {
    return this.currentCode;
  }

  changeLanguageTo(lang: string) {
    switch (lang) {
      case "UA":
        this.currentLanguageFlag = "../../assets/flags/ukraine.png";
        this.currentCode = "ru";
        this.currentLanguage$.next(languageData.ua);
        break;
      case "FR":
        this.currentLanguageFlag = "../../assets/flags/france.png";
        this.currentCode = "fr";
        this.currentLanguage$.next(languageData.fr);
        break;
      default:
        this.currentLanguageFlag = "../../assets/flags/united-kingdom.png";
        this.currentCode = "en";
        this.currentLanguage$.next(languageData.en);
        break;
    }
  }

  saveUserLanguage(lang: string) {
    this._db.updateCurrentUser({ language: lang });
  }
}

