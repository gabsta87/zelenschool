import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalWorkingHoursComponent } from './modal-working-hours.component';

describe('ModalWorkingHoursComponent', () => {
  let component: ModalWorkingHoursComponent;
  let fixture: ComponentFixture<ModalWorkingHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalWorkingHoursComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalWorkingHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
