import { TestBed } from '@angular/core/testing';

import { CanDeactivateEditApplicationGuard } from './can-deactivate-edit-application.guard';

describe('CanDeactivateEditApplicationGuard', () => {
  let guard: CanDeactivateEditApplicationGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CanDeactivateEditApplicationGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
