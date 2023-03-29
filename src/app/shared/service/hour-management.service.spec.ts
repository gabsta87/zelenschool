import { TestBed } from '@angular/core/testing';

import { HourManagementService } from './hour-management.service';

describe('HourManagementService', () => {
  let service: HourManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HourManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
