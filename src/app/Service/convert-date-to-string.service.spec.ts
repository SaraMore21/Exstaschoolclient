import { TestBed } from '@angular/core/testing';

import { ConvertDateToStringService } from './convert-date-to-string.service';

describe('ConvertDateToStringService', () => {
  let service: ConvertDateToStringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvertDateToStringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
