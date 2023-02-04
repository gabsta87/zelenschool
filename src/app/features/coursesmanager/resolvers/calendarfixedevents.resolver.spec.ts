import { TestBed } from '@angular/core/testing';

import { CalendarfixedeventsResolver } from './calendarfixedevents.resolver';

describe('CalendarfixedeventsResolver', () => {
  let resolver: CalendarfixedeventsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(CalendarfixedeventsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
