import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerspageComponent } from './partnerspage.component';

describe('PartnerspageComponent', () => {
  let component: PartnerspageComponent;
  let fixture: ComponentFixture<PartnerspageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartnerspageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
