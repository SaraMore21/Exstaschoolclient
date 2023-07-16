import { TestBed } from '@angular/core/testing';

import { ProfessionCategoryServiceService } from './profession-category-service.service';

describe('ProfessionCategoryServiceService', () => {
  let service: ProfessionCategoryServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfessionCategoryServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
