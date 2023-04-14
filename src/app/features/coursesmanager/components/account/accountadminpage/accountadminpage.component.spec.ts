import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountadminpageComponent } from './accountadminpage.component';

describe('AccountadminpageComponent', () => {
  let component: AccountadminpageComponent;
  let fixture: ComponentFixture<AccountadminpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountadminpageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountadminpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
