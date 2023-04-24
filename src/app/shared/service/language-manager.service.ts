import { Injectable } from '@angular/core';
import languageData from '../../../assets/lang/data.json';


@Injectable({
  providedIn: 'root'
})
export class LanguageManagerService {

  currentLanguage = languageData.en;

  constructor() { }

  loadLanguage(lang:Language){
    switch(lang){
      case Language.UA:
        this.currentLanguage = languageData.ua;
        break;
      case Language.FR:
        this.currentLanguage = languageData.fr;
        break;
      default:
        this.currentLanguage = languageData.en;
        break;
    }
  }
}

export enum Language{
  UA,FR,EN
}
