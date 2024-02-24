import { TestBed } from '@angular/core/testing';

import { CalendarEntryService } from './calendar-entry.service';

describe('CalendarEntryService', () => {
  let service: CalendarEntryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalendarEntryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
