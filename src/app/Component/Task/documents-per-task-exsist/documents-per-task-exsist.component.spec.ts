import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsPerTaskExsistComponent } from './documents-per-task-exsist.component';

describe('DocumentsPerTaskExsistComponent', () => {
  let component: DocumentsPerTaskExsistComponent;
  let fixture: ComponentFixture<DocumentsPerTaskExsistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsPerTaskExsistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsPerTaskExsistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
