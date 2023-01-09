import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerpageComponent } from './containerpage.component';

describe('ContainerpageComponent', () => {
  let component: ContainerpageComponent;
  let fixture: ComponentFixture<ContainerpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContainerpageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
