import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonatepageComponent } from './donatepage.component';

describe('DonatepageComponent', () => {
  let component: DonatepageComponent;
  let fixture: ComponentFixture<DonatepageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DonatepageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonatepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
