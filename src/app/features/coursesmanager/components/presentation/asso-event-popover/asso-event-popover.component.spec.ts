import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssoEventPopoverComponent } from './asso-event-popover.component';

describe('AssoEventPopoverComponent', () => {
  let component: AssoEventPopoverComponent;
  let fixture: ComponentFixture<AssoEventPopoverComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssoEventPopoverComponent]
    });
    fixture = TestBed.createComponent(AssoEventPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
