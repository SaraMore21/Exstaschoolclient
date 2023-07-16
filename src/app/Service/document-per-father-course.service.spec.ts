import { TestBed } from '@angular/core/testing';

import { DocumentPerFatherCourseService } from './document-per-father-course.service';

describe('DocumentPerFatherCourseService', () => {
  let service: DocumentPerFatherCourseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentPerFatherCourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
