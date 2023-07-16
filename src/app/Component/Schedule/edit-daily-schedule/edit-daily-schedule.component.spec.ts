import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDailyScheduleComponent } from './edit-daily-schedule.component';

describe('EditDailyScheduleComponent', () => {
  let component: EditDailyScheduleComponent;
  let fixture: ComponentFixture<EditDailyScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDailyScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDailyScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
