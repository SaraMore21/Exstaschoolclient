import { TestBed } from '@angular/core/testing';

import { HebrewCalanderService } from './hebrew-calander.service';

describe('HebrewCalanderService', () => {
  let service: HebrewCalanderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HebrewCalanderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
