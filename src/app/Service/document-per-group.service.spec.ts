import { TestBed } from '@angular/core/testing';

import { DocumentPerGroupService } from './document-per-group.service';

describe('DocumentPerGroupService', () => {
  let service: DocumentPerGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentPerGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
