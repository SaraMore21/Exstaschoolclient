import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsPerStudentComponent } from './documents-per-student.component';

describe('DocumentsPerStudentComponent', () => {
  let component: DocumentsPerStudentComponent;
  let fixture: ComponentFixture<DocumentsPerStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsPerStudentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsPerStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
