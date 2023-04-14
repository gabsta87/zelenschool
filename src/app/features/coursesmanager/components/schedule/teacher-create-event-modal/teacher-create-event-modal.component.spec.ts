import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherCreateEventModalComponent } from './teacher-create-event-modal.component';

describe('TeacherCreateEventModalComponent', () => {
  let component: TeacherCreateEventModalComponent;
  let fixture: ComponentFixture<TeacherCreateEventModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherCreateEventModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherCreateEventModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
