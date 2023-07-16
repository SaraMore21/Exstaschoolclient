import { TestBed } from '@angular/core/testing';

import { DocumentPerStudentService } from './document-per-student.service';

describe('DocumentPerStudentService', () => {
  let service: DocumentPerStudentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentPerStudentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
