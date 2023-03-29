import { Injectable } from '@angular/core';
import * as dayjs from 'dayjs';
import * as isBetween from 'dayjs/plugin/isBetween';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc)
dayjs.extend(isBetween);

@Injectable({
  providedIn: 'root'
})
export class HourManagementService {

  constructor() { }

  

  private isColliding(startTime1:string, endTime1:string ,startTime2:string, endTime2:string){
    if(dayjs(startTime1).isBetween(startTime2,endTime2,'minutes','[)')) return true;  // 1 starts in 2
    if(dayjs(endTime1).isBetween(startTime2,endTime2,'minutes','(]')) return true;    // 1 ends in 2
    if(dayjs(startTime2).isBetween(startTime1,endTime1,'minutes','[)'))return true;   // 2 starts in 1
    return false;
  }
}
