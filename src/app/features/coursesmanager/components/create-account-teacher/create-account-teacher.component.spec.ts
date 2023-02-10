import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAccountTeacherComponent } from './create-account-teacher.component';

describe('CreateAccountTeacherComponent', () => {
  let component: CreateAccountTeacherComponent;
  let fixture: ComponentFixture<CreateAccountTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateAccountTeacherComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAccountTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
