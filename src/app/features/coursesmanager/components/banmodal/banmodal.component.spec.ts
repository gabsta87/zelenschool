import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanmodalComponent } from './banmodal.component';

describe('BanmodalComponent', () => {
  let component: BanmodalComponent;
  let fixture: ComponentFixture<BanmodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BanmodalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BanmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
