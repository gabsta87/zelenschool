import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAssoMemberModalComponent } from './new-asso-member-modal.component';

describe('NewAssoMemberModalComponent', () => {
  let component: NewAssoMemberModalComponent;
  let fixture: ComponentFixture<NewAssoMemberModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewAssoMemberModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAssoMemberModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
