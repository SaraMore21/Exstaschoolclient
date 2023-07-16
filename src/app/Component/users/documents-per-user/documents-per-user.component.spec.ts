import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsPerUserComponent } from './documents-per-user.component';

describe('DocumentsPerUserComponent', () => {
  let component: DocumentsPerUserComponent;
  let fixture: ComponentFixture<DocumentsPerUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsPerUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsPerUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
