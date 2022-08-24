import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDecisionMeetingDialogComponent } from './create-decision-meeting-dialog.component';

describe('CreateDecisionMeetingDialogComponent', () => {
  let component: CreateDecisionMeetingDialogComponent;
  let fixture: ComponentFixture<CreateDecisionMeetingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateDecisionMeetingDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDecisionMeetingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
