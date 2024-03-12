import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCourseToStudentComponent } from './list-course-to-student.component';

describe('ListCourseToStudentComponent', () => {
  let component: ListCourseToStudentComponent;
  let fixture: ComponentFixture<ListCourseToStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListCourseToStudentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListCourseToStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
