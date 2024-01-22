import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDetailService } from '../../services/notice-of-intent/notice-of-intent-detail.service';
import { NoticeOfIntentModificationDto } from '../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentModificationService } from '../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.service';
import { NoticeOfIntentDto } from '../../services/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntentSubmissionStatusService } from '../../services/notice-of-intent/notice-of-intent-submission-status/notice-of-intent-submission-status.service';

import { NoticeOfIntentComponent } from './notice-of-intent.component';

describe('NoticeOfIntentComponent', () => {
  let component: NoticeOfIntentComponent;
  let fixture: ComponentFixture<NoticeOfIntentComponent>;
  let mockNOIDetailService: DeepMocked<NoticeOfIntentDetailService>;
  let mockNOIModificationService: DeepMocked<NoticeOfIntentModificationService>;
  let mockNOIStatusService: DeepMocked<NoticeOfIntentSubmissionStatusService>;

  beforeEach(async () => {
    mockNOIDetailService = createMock();
    mockNOIDetailService.$noticeOfIntent = new BehaviorSubject<NoticeOfIntentDto | undefined>(undefined);
    mockNOIModificationService = createMock();
    mockNOIModificationService.$modifications = new BehaviorSubject<NoticeOfIntentModificationDto[]>([]);
    mockNOIStatusService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: NoticeOfIntentDetailService,
          useValue: mockNOIDetailService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: new EventEmitter(),
          },
        },
        {
          provide: NoticeOfIntentModificationService,
          useValue: mockNOIModificationService,
        },
        {
          provide: NoticeOfIntentSubmissionStatusService,
          useValue: mockNOIStatusService,
        },
        {
          provide: Router,
          useValue: {},
        },
      ],
      declarations: [NoticeOfIntentComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NoticeOfIntentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
