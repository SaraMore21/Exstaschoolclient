import { TestBed } from '@angular/core/testing';

import { DocumentPerTaskExsistService } from './document-per-task-exsist.service';

describe('DocumentPerTaskExsistService', () => {
  let service: DocumentPerTaskExsistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentPerTaskExsistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
