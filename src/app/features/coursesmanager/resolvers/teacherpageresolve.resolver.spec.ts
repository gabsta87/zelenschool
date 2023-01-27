import { TestBed } from '@angular/core/testing';

import { TeacherpageresolveResolver } from './teacherpageresolve.resolver';

describe('TeacherpageresolveResolver', () => {
  let resolver: TeacherpageresolveResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(TeacherpageresolveResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
