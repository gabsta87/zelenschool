import { TestBed } from '@angular/core/testing';

import { AngularfireService } from './angularfire.service';

describe('AngularfireService', () => {
  let service: AngularfireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularfireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
