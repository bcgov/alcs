import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDetailService } from '../../../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent/notice-of-intent-submission/notice-of-intent-submission.service';
import { NoticeOfIntentDto } from '../../../../services/notice-of-intent/notice-of-intent.dto';
import { ToastService } from '../../../../services/toast/toast.service';

import { SoilProposalComponent } from './soil.component';

describe('SoilComponent', () => {
  let component: SoilProposalComponent;
  let fixture: ComponentFixture<SoilProposalComponent>;
  let mockNoiDetailService: DeepMocked<NoticeOfIntentDetailService>;
  let mockNoiSubmissionService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockNoiDetailService = createMock();
    mockNoiSubmissionService = createMock();
    mockToastService = createMock();

    mockNoiDetailService.$noticeOfIntent = new BehaviorSubject<NoticeOfIntentDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [SoilProposalComponent],
      providers: [
        {
          provide: NoticeOfIntentDetailService,
          useValue: mockNoiDetailService,
        },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockNoiSubmissionService,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SoilProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
