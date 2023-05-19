import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildCreationModalComponent } from './child-creation-modal.component';

describe('ChildCreationModalComponent', () => {
  let component: ChildCreationModalComponent;
  let fixture: ComponentFixture<ChildCreationModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChildCreationModalComponent]
    });
    fixture = TestBed.createComponent(ChildCreationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
