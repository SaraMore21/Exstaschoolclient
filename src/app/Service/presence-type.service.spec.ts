import { TestBed } from '@angular/core/testing';

import { PresenceTypeService } from './presence-type.service';

describe('PresenceTypeService', () => {
  let service: PresenceTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PresenceTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
