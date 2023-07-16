import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFatherCourseComponent } from './list-father-course.component';

describe('ListFatherCourseComponent', () => {
  let component: ListFatherCourseComponent;
  let fixture: ComponentFixture<ListFatherCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListFatherCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFatherCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
