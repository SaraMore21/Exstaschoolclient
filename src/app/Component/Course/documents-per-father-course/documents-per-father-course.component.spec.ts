import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsPerFatherCourseComponent } from './documents-per-father-course.component';

describe('DocumentsPerFatherCourseComponent', () => {
  let component: DocumentsPerFatherCourseComponent;
  let fixture: ComponentFixture<DocumentsPerFatherCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsPerFatherCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsPerFatherCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
