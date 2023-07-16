import { TestBed } from '@angular/core/testing';

import { DocumentPerUserService } from './document-per-user.service';

describe('DocumentPerUserService', () => {
  let service: DocumentPerUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentPerUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
