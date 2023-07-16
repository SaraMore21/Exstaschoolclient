import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsPerProfessionComponent } from './documents-per-profession.component';

describe('DocumentsPerProfessionComponent', () => {
  let component: DocumentsPerProfessionComponent;
  let fixture: ComponentFixture<DocumentsPerProfessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsPerProfessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsPerProfessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
