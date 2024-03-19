import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssoCenterModalComponent } from './asso-center-modal.component';

describe('AssoCenterModalComponent', () => {
  let component: AssoCenterModalComponent;
  let fixture: ComponentFixture<AssoCenterModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssoCenterModalComponent]
    });
    fixture = TestBed.createComponent(AssoCenterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
