import { TestBed } from '@angular/core/testing';

import { DocumentPerProfessionService } from './document-per-profession.service';

describe('DocumentPerProfessionService', () => {
  let service: DocumentPerProfessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentPerProfessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
