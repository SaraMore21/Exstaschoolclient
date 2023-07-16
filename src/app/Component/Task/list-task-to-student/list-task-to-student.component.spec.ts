import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTaskToStudentComponent } from './list-task-to-student.component';

describe('ListTaskToStudentComponent', () => {
  let component: ListTaskToStudentComponent;
  let fixture: ComponentFixture<ListTaskToStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListTaskToStudentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTaskToStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
