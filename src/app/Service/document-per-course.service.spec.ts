import { TestBed } from '@angular/core/testing';

import { DocumentPerCourseService } from './document-per-course.service';

describe('DocumentPerCourseService', () => {
  let service: DocumentPerCourseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentPerCourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
