import { TestBed } from '@angular/core/testing';

import { AssoMemberService } from './asso-member.service';

describe('AssoMemberService', () => {
  let service: AssoMemberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssoMemberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
