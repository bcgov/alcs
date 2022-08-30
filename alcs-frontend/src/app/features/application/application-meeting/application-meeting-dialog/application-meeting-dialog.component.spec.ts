import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationMeetingDialogComponent } from './application-meeting-dialog.component';

describe('ApplicationMeetingDialogComponent', () => {
  let component: ApplicationMeetingDialogComponent;
  let fixture: ComponentFixture<ApplicationMeetingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationMeetingDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationMeetingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
