import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewNoticeOfIntentSubmissionComponent } from './view-notice-of-intent-submission.component';

describe('ViewSubmissionComponent', () => {
  let component: ViewNoticeOfIntentSubmissionComponent;
  let fixture: ComponentFixture<ViewNoticeOfIntentSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewNoticeOfIntentSubmissionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewNoticeOfIntentSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
