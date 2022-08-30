import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationMeetingComponent } from './application-meeting.component';

describe('ApplicationMeetingComponent', () => {
  let component: ApplicationMeetingComponent;
  let fixture: ComponentFixture<ApplicationMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationMeetingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
