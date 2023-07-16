import { TestBed } from '@angular/core/testing';

import { QuestionsOfTaskService } from './questions-of-task.service';

describe('QuestionsOfTaskService', () => {
  let service: QuestionsOfTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionsOfTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
