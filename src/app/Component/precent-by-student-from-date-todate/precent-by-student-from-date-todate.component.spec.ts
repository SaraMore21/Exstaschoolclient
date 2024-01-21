import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrecentByStudentFromDateTODAteComponent } from './precent-by-student-from-date-todate.component';

describe('PrecentByStudentFromDateTODAteComponent', () => {
  let component: PrecentByStudentFromDateTODAteComponent;
  let fixture: ComponentFixture<PrecentByStudentFromDateTODAteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrecentByStudentFromDateTODAteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrecentByStudentFromDateTODAteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
