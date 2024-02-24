import { TestBed } from '@angular/core/testing';

import { MainAccessService } from './main-access.service';

describe('MainAccessService', () => {
  let service: MainAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
