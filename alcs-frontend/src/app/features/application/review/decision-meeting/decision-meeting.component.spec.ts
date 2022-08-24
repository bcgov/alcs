import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionMeetingComponent } from './decision-meeting.component';

describe('DecisionMeetingComponent', () => {
  let component: DecisionMeetingComponent;
  let fixture: ComponentFixture<DecisionMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecisionMeetingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecisionMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
