import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountteacherpageComponent } from './accountteacherpage.component';

describe('AccountteacherpageComponent', () => {
  let component: AccountteacherpageComponent;
  let fixture: ComponentFixture<AccountteacherpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountteacherpageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountteacherpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
