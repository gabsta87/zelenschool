import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAssoCenterModalComponent } from './new-asso-center-modal.component';

describe('NewAssoCenterModalComponent', () => {
  let component: NewAssoCenterModalComponent;
  let fixture: ComponentFixture<NewAssoCenterModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewAssoCenterModalComponent]
    });
    fixture = TestBed.createComponent(NewAssoCenterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
