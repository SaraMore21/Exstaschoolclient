import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrUpdateUserComponent } from './add-or-update-user.component';

describe('AddOrUpdateUserComponent', () => {
  let component: AddOrUpdateUserComponent;
  let fixture: ComponentFixture<AddOrUpdateUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddOrUpdateUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOrUpdateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
