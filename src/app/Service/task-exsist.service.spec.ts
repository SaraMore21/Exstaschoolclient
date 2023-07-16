import { TestBed } from '@angular/core/testing';

import { TaskExsistService } from './task-exsist.service';

describe('TaskExsistService', () => {
  let service: TaskExsistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskExsistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
