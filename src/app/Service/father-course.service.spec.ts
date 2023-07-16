import { TestBed } from '@angular/core/testing';

import { FatherCourseService } from './father-course.service';

describe('FatherCourseService', () => {
  let service: FatherCourseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FatherCourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
