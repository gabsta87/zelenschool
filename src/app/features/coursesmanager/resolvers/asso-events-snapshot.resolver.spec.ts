import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { assoEventsSnapshotResolver } from './asso-events-snapshot.resolver';

describe('assoEventsSnapshotResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => assoEventsSnapshotResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
