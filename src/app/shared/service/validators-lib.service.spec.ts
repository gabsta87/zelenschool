import { TestBed } from '@angular/core/testing';

import { ValidatorsLibService } from './validators-lib.service';

describe('ValidatorsLibService', () => {
  let service: ValidatorsLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidatorsLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
