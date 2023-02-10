import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleadminpageComponent } from './scheduleadminpage.component';

describe('ScheduleadminpageComponent', () => {
  let component: ScheduleadminpageComponent;
  let fixture: ComponentFixture<ScheduleadminpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduleadminpageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleadminpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
