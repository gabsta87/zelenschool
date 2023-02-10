import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleteacherpageComponent } from './scheduleteacherpage.component';

describe('ScheduleteacherpageComponent', () => {
  let component: ScheduleteacherpageComponent;
  let fixture: ComponentFixture<ScheduleteacherpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduleteacherpageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleteacherpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
