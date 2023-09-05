import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationSubmissionStatusService } from '../../services/application/application-submission-status/application-submission-status.service';

import { DetailsHeaderComponent } from './details-header.component';
import { NoticeOfIntentSubmissionStatusService } from '../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';

describe('DetailsHeaderComponent', () => {
  let component: DetailsHeaderComponent;
  let fixture: ComponentFixture<DetailsHeaderComponent>;
  let mockApplicationSubmissionStatusService: DeepMocked<ApplicationSubmissionStatusService>;
  let mockNoticeOfIntentSubmissionStatusService: DeepMocked<NoticeOfIntentSubmissionStatusService>;

  beforeEach(async () => {
    mockApplicationSubmissionStatusService = createMock();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [DetailsHeaderComponent],
      providers: [
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockApplicationSubmissionStatusService,
        },
        {
          provide: NoticeOfIntentSubmissionStatusService,
          useValue: mockNoticeOfIntentSubmissionStatusService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
