import { TestBed } from '@angular/core/testing';

import { StudentpageGuard } from './studentpage.guard';

describe('StudentpageGuard', () => {
  let guard: StudentpageGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(StudentpageGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
