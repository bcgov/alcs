import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticeOfIntentMeetingDialogComponent } from './notice-of-intent-meeting-dialog.component';

describe('NoticeOfIntentMeetingDialogComponent', () => {
  let component: NoticeOfIntentMeetingDialogComponent;
  let fixture: ComponentFixture<NoticeOfIntentMeetingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoticeOfIntentMeetingDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoticeOfIntentMeetingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
