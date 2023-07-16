import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTaskExsistComponent } from './list-task-exsist.component';

describe('ListTaskExsistComponent', () => {
  let component: ListTaskExsistComponent;
  let fixture: ComponentFixture<ListTaskExsistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListTaskExsistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTaskExsistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
