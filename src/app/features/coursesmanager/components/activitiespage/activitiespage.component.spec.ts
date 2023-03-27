import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiespageComponent } from './activitiespage.component';

describe('ActivitiespageComponent', () => {
  let component: ActivitiespageComponent;
  let fixture: ComponentFixture<ActivitiespageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivitiespageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivitiespageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
