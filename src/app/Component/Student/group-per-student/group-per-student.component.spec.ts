import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupPerStudentComponent } from './group-per-student.component';

describe('GroupPerStudentComponent', () => {
  let component: GroupPerStudentComponent;
  let fixture: ComponentFixture<GroupPerStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupPerStudentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupPerStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
