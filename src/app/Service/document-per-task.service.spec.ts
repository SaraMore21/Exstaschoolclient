import { TestBed } from '@angular/core/testing';

import { DocumentPerTaskService } from './document-per-task.service';

describe('DocumentPerTaskService', () => {
  let service: DocumentPerTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentPerTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
