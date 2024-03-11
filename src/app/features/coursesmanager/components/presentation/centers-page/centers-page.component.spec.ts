import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentersPageComponent } from './centers-page.component';

describe('CentersPageComponent', () => {
  let component: CentersPageComponent;
  let fixture: ComponentFixture<CentersPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CentersPageComponent]
    });
    fixture = TestBed.createComponent(CentersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
