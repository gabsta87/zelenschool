import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryNameModalComponent } from './gallery-name-modal.component';

describe('GalleryNameModalComponent', () => {
  let component: GalleryNameModalComponent;
  let fixture: ComponentFixture<GalleryNameModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GalleryNameModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GalleryNameModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
