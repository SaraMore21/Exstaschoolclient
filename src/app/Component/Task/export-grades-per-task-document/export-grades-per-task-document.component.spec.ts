import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportGradesPerTaskDocumentComponent } from './export-grades-per-task-document.component';

describe('ExportGradesPerTaskDocumentComponent', () => {
  let component: ExportGradesPerTaskDocumentComponent;
  let fixture: ComponentFixture<ExportGradesPerTaskDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportGradesPerTaskDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportGradesPerTaskDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
