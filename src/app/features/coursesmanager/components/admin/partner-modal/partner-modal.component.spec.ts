import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerModalComponent } from './partner-modal.component';

describe('PartnerModalComponent', () => {
  let component: PartnerModalComponent;
  let fixture: ComponentFixture<PartnerModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerModalComponent]
    });
    fixture = TestBed.createComponent(PartnerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
