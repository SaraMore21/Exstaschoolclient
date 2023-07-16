import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrUpdateProfessionComponent } from './add-or-update-profession.component';

describe('AddOrUpdateProfessionComponent', () => {
  let component: AddOrUpdateProfessionComponent;
  let fixture: ComponentFixture<AddOrUpdateProfessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddOrUpdateProfessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOrUpdateProfessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
