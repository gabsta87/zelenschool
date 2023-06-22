import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BirthdayFieldComponent } from './birthday-field.component';

describe('BirthdayFieldComponent', () => {
  let component: BirthdayFieldComponent;
  let fixture: ComponentFixture<BirthdayFieldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BirthdayFieldComponent]
    });
    fixture = TestBed.createComponent(BirthdayFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
