import { TestBed } from '@angular/core/testing';

import { DocumentPerSchoolService } from './document-per-school.service';

describe('DocumentPerSchoolService', () => {
  let service: DocumentPerSchoolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentPerSchoolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
