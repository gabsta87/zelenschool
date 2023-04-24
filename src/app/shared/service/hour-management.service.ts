import { Injectable } from '@angular/core';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(utc)
dayjs.extend(isBetween);
dayjs.extend(timezone)
dayjs.extend(minMax)

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
    return dayjs(timeToFormat).toString();
  }
}

export function formatForIonDateTime(timeToFormat:string|dayjs.Dayjs):string{
  // console.log("time to format : ",timeToFormat);
  // console.log("to iso : ",dayjs(timeToFormat).toISOString());
  // console.log("to local iso : ",dayjs(timeToFormat).local().toISOString());
  // console.log("to local : ",dayjs(timeToFormat).local().toString());
  // console.log("simple : ",dayjs(timeToFormat).toString());
  // console.log("to date : ",dayjs(timeToFormat).toDate().toString());
  // console.log("to date ISO : ",dayjs(timeToFormat).toDate().toISOString());
  
  
  return dayjs(timeToFormat).toDate().toISOString();
}

export function formatForDB(timeToFormat:string|dayjs.Dayjs):string{
  return dayjs(timeToFormat).local().toString();
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

export function timeMin(time1:dayjs.Dayjs,time2:dayjs.Dayjs){
  return dayjs.min(time1,time2);
}
