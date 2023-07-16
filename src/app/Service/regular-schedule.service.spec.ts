import { TestBed } from '@angular/core/testing';

import { RegularScheduleService } from './regular-schedule.service';

describe('RegularScheduleService', () => {
  let service: RegularScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegularScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
