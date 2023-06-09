import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteAccountModalComponent } from './complete-account-modal.component';

describe('CompleteAccountModalComponent', () => {
  let component: CompleteAccountModalComponent;
  let fixture: ComponentFixture<CompleteAccountModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompleteAccountModalComponent]
    });
    fixture = TestBed.createComponent(CompleteAccountModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
