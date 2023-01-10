import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulepageComponent } from './schedulepage.component';

describe('SchedulepageComponent', () => {
  let component: SchedulepageComponent;
  let fixture: ComponentFixture<SchedulepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchedulepageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
