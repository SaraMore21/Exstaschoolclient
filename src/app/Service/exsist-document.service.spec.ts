import { TestBed } from '@angular/core/testing';

import { ExsistDocumentService } from './exsist-document.service';

describe('ExsistDocumentService', () => {
  let service: ExsistDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExsistDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
