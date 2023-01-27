import { TestBed } from '@angular/core/testing';

import { AdminpageGuard } from './adminpage.guard';

describe('AdminpageGuard', () => {
  let guard: AdminpageGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AdminpageGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
