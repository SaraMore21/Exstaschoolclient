import { TestBed } from '@angular/core/testing';

import { TypeTaskService } from './type-task.service';

describe('TypeTaskService', () => {
  let service: TypeTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
