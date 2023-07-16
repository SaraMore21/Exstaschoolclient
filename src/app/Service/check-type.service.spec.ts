import { TestBed } from '@angular/core/testing';

import { CheckTypeService } from './check-type.service';

describe('CheckTypeService', () => {
  let service: CheckTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
