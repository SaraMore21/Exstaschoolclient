import { TestBed } from '@angular/core/testing';

import { StatusTaskPerformanceService } from './status-task-performance.service';

describe('StatusTaskPerformanceService', () => {
  let service: StatusTaskPerformanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatusTaskPerformanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
