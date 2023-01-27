import { TestBed } from '@angular/core/testing';

import { AdminpageresolveResolver } from './adminpageresolve.resolver';

describe('AdminpageresolveResolver', () => {
  let resolver: AdminpageresolveResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(AdminpageresolveResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
