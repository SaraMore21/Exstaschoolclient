import { TestBed } from '@angular/core/testing';

import { AttendanceMarkingService } from './attendance-marking.service';

describe('AttendanceMarkingService', () => {
  let service: AttendanceMarkingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttendanceMarkingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
