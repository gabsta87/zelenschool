import { TestBed } from '@angular/core/testing';

import { AboutPageResolver } from './about-page.resolver';

describe('AboutPageResolver', () => {
  let resolver: AboutPageResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(AboutPageResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
