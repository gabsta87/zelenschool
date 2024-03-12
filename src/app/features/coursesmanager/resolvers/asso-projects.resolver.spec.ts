import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { assoProjectsResolver } from './asso-projects.resolver';

describe('assoProjectsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => assoProjectsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
