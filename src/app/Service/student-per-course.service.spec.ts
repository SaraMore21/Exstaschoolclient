import { TestBed } from '@angular/core/testing';

import { StudentPerCourseService } from './student-per-course.service';

describe('StudentPerCourseService', () => {
  let service: StudentPerCourseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentPerCourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
