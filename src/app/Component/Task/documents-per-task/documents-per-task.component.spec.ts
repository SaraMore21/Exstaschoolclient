import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsPerTaskComponent } from './documents-per-task.component';

describe('DocumentsPerTaskComponent', () => {
  let component: DocumentsPerTaskComponent;
  let fixture: ComponentFixture<DocumentsPerTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsPerTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsPerTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
