import { Injectable } from '@angular/core';
import languageData from '../../../assets/lang/data.json';


@Injectable({
  providedIn: 'root'
})
export class LanguageManagerService {

  constructor() { }
  
  showData(){
    console.log("file ",languageData);

  }
}
