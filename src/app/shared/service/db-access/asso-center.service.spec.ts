import { TestBed } from '@angular/core/testing';

import { AssoCenterService } from './asso-center.service';

describe('AssoCenterService', () => {
  let service: AssoCenterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssoCenterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
