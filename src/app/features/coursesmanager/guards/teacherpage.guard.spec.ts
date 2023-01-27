import { TestBed } from '@angular/core/testing';

import { TeacherpageGuard } from './teacherpage.guard';

describe('TeacherpageGuard', () => {
  let guard: TeacherpageGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(TeacherpageGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
