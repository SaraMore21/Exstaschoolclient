import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsPerGroupComponent } from './documents-per-group.component';

describe('DocumentsPerGroupComponent', () => {
  let component: DocumentsPerGroupComponent;
  let fixture: ComponentFixture<DocumentsPerGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsPerGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsPerGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
