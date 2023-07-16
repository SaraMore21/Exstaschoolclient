import { TestBed } from '@angular/core/testing';

import { ProfessionCategoryService } from './profession-category.service';

describe('ProfessionCategoryService', () => {
  let service: ProfessionCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfessionCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
