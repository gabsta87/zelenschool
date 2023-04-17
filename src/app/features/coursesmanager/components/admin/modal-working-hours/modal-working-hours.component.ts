import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { Observable, firstValueFrom, groupBy, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-modal-working-hours',
  templateUrl: './modal-working-hours.component.html',
  styleUrls: ['./modal-working-hours.component.scss']
})
export class ModalWorkingHoursComponent {
  @Input() teacher!:any;
  @Input() courses!:any[];
  displayingCourses !:any[];
  selectedMonth !: any;
  availableMonths !:any;
  total = 0;

  constructor(private readonly modalController:ModalController){}

  async ionViewWillEnter(){
    this.availableMonths = Object.keys(this.courses);
  }

  selectMonth(event:any){
    this.total = 0;

    this.displayingCourses = this.courses[event.detail.value].map((course:any) => {
      course.duration = dayjs(course.timeEnd).diff(course.timeStart,"minute")
      this.total += course.duration;
      return course;
    })
  }

  dismissModal(){
    this.modalController.dismiss();
  }
}
