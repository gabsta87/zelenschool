import { TestBed } from '@angular/core/testing';

import { UserpageResolver } from './userpage.resolver';

describe('UserpageResolver', () => {
  let resolver: UserpageResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(UserpageResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
