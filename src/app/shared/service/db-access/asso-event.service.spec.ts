import { TestBed } from '@angular/core/testing';

import { AssoEventService } from './asso-event.service';

describe('AssoEventService', () => {
  let service: AssoEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssoEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
