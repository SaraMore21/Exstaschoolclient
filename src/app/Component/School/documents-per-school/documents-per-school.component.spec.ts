import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsPerSchoolComponent } from './documents-per-school.component';

describe('DocumentsPerSchoolComponent', () => {
  let component: DocumentsPerSchoolComponent;
  let fixture: ComponentFixture<DocumentsPerSchoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsPerSchoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsPerSchoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
