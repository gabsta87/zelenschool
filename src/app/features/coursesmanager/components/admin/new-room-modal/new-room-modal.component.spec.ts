import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRoomModalComponent } from './new-room-modal.component';

describe('NewRoomModalComponent', () => {
  let component: NewRoomModalComponent;
  let fixture: ComponentFixture<NewRoomModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewRoomModalComponent]
    });
    fixture = TestBed.createComponent(NewRoomModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
