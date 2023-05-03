import { Injectable } from '@angular/core';
import languageData from '../../../assets/lang/data.json';

@Injectable({
  providedIn: 'root'
})
export class LanguageManagerService {

  currentLanguage!:any;
  currentCode!:string;

  constructor() {
    this.changeLanguageTo(Language.EN)
  }

  getCurrentCode(){
    return this.currentCode;
  }

  changeLanguageTo(lang:Language){
    switch(lang){
      case Language.UA:
        this.currentLanguage = languageData.ua;
        this.currentCode = "ru";
        break;
      case Language.FR:
        this.currentLanguage = languageData.fr;
        this.currentCode = "fr";
        break;
      default:
        this.currentLanguage = languageData.en;
        this.currentCode = "en";
        break;
    }
  }
}

export enum Language{
  UA,FR,EN
}
