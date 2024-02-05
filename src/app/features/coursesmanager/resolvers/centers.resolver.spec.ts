import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { centersResolver } from './centers.resolver';

describe('centersResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => centersResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
