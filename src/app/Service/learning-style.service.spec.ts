import { TestBed } from '@angular/core/testing';

import { LearningStyleService } from './learning-style.service';

describe('LearningStyleService', () => {
  let service: LearningStyleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LearningStyleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
