import { TestBed } from '@angular/core/testing';

import { TypeContactService } from './type-contact.service';

describe('TypeContactService', () => {
  let service: TypeContactService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeContactService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
