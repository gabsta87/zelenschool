import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import dayjs, { Dayjs } from 'dayjs';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsLibService { }

export function phoneValidator(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {

    let tempVal:string = c.value;

    if(tempVal.replaceAll(new RegExp("\\D","g"),"").length < 10)
      return {"tooshort":true}

    let expression = RegExp("^\\+?(\\d{2,3} ?)+$");
    if(!expression.test(c.value))
      return {'wrongformat':true}
    
    return null;
  };
}

export function passwordValidator(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    let first = c.get("password")?.value;
    let second = c.get("password2")?.value;

    if(first.length < 6)
      return {'passwordTooShort':true}

    if(first !== second)
      return {'passwordMismatch': true}
    
    return null;
  };
}

export function permitValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    let expression = RegExp("^([A-Za-z]{2}\\d{7})?$");

    if (!expression.test(control.value))
      return { 'invalidPermitFormat': true };
    
    return null;
  };
}

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    let expression = RegExp("^[\\w\\.\\-]+@[\\w\\.\\-]+\\.\\w{2,4}$");

    if (!expression.test(control.value))
      return { 'invalidemail': true };
    
    return null;
  };
}

export function bdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    // const expression = RegExp("^((0?[1-9]|[12][0-9]|3[01])[- /.]){2}(?:\\d{2}){1,2}$");
    const expression = RegExp("^((\\d{1,2})[- /.]){2}(?:\\d{2}){1,2}$");

    let parts = control.value.split(/[- /.]/); 
    let year = parts[2];
    let month = parts[1];
    let day = parts[0];

    if((year >= 100 && year <= 1900) || year <= 0 || year > new Date().getFullYear())
      return { 'invalidDate': true };

    if(month < 0 || month > 12)
      return { 'invalidDate': true };

    if(day < 0 || day > 31)
      return { 'invalidDate': true };

    if (!expression.test(control.value))
      return { 'invalidDate': true };

    return null;
  };
}
