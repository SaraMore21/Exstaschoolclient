import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyAttendanceForGroupComponent } from './daily-attendance-for-group.component';

describe('DailyAttendanceForGroupComponent', () => {
  let component: DailyAttendanceForGroupComponent;
  let fixture: ComponentFixture<DailyAttendanceForGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyAttendanceForGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyAttendanceForGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
