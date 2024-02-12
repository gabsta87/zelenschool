import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterOpeningHourModalComponent } from './center-opening-hour-modal.component';

describe('CenterOpeningHourModalComponent', () => {
  let component: CenterOpeningHourModalComponent;
  let fixture: ComponentFixture<CenterOpeningHourModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterOpeningHourModalComponent]
    });
    fixture = TestBed.createComponent(CenterOpeningHourModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
