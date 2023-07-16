import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsPerCourseComponent } from './documents-per-course.component';

describe('DocumentsPerCourseComponent', () => {
  let component: DocumentsPerCourseComponent;
  let fixture: ComponentFixture<DocumentsPerCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsPerCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsPerCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
