import { TestBed } from '@angular/core/testing';

import { FilesAzureService } from './files-azure.service';

describe('FilesAzureService', () => {
  let service: FilesAzureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilesAzureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
