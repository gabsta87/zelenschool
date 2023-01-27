import { TestBed } from '@angular/core/testing';

import { CalendareventsresolveResolver } from './calendareventsresolve.resolver';

describe('CalendareventsresolveResolver', () => {
  let resolver: CalendareventsresolveResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(CalendareventsresolveResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
