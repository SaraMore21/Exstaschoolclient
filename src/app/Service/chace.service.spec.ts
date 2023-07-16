import { TestBed } from '@angular/core/testing';

import { ChaceService } from './chace.service';

describe('ChaceService', () => {
  let service: ChaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
