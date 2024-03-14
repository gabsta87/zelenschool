import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { assoEventsResolver } from './asso-events.resolver';

describe('assoEventsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => assoEventsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
