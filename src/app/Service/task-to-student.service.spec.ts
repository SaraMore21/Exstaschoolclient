import { TestBed } from '@angular/core/testing';

import { TaskToStudentService } from './task-to-student.service';

describe('TaskToStudentService', () => {
  let service: TaskToStudentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskToStudentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
