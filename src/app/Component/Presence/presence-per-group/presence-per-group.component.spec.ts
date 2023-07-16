import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresencePerGroupComponent } from './presence-per-group.component';

describe('PresencePerGroupComponent', () => {
  let component: PresencePerGroupComponent;
  let fixture: ComponentFixture<PresencePerGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresencePerGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresencePerGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
