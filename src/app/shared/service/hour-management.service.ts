import { Injectable } from '@angular/core';
import * as dayjs from 'dayjs';
import * as isBetween from 'dayjs/plugin/isBetween';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc)
dayjs.extend(isBetween);
dayjs.extend(timezone)

@Injectable({
  providedIn: 'root'
})
export class HourManagementService { }

// const myFormat = "local" as string;
// const myFormat = "utc" as string;
const myFormat = "none" as string;

export function formatTime(timeToFormat:string|dayjs.Dayjs):string{
  
  if(myFormat === "local"){
    return dayjs(timeToFormat).local().toISOString();
  }else if(myFormat === "utc"){
    return dayjs(timeToFormat).utc().toISOString();
  }else{
    return timeToFormat.toString();
  }
}

export function getNowDate(){

  if(myFormat === "local"){
    return dayjs(new Date()).local().toISOString()
  }else if(myFormat === "utc"){
    return dayjs(new Date()).utc().toISOString()
  }else{
    return dayjs(new Date()).format();
  }
}

export function isColliding(startTime1:string, endTime1:string ,startTime2:string, endTime2:string){
  if(dayjs(startTime1).isBetween(startTime2,endTime2,'minutes','[)')) return true;  // 1 starts in 2
  if(dayjs(endTime1).isBetween(startTime2,endTime2,'minutes','(]')) return true;    // 1 ends in 2
  if(dayjs(startTime2).isBetween(startTime1,endTime1,'minutes','[)'))return true;   // 2 starts in 1
  return false;
}

