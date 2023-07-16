import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsPerGroupComponent } from './students-per-group.component';

describe('StudentsPerGroupComponent', () => {
  let component: StudentsPerGroupComponent;
  let fixture: ComponentFixture<StudentsPerGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentsPerGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentsPerGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
