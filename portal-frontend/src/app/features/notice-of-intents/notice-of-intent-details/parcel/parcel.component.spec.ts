import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentOwnerService } from '../../../../services/notice-of-intent-owner/notice-of-intent-owner.service';
import { NoticeOfIntentParcelService } from '../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { ParcelComponent } from './parcel.component';

describe('ParcelComponent', () => {
  let component: ParcelComponent;
  let fixture: ComponentFixture<ParcelComponent>;

  let mockNoiParcelService: DeepMocked<NoticeOfIntentParcelService>;
  let mockNoiOwnerService: DeepMocked<NoticeOfIntentOwnerService>;
  let mockNoiDocService: DeepMocked<NoticeOfIntentDocumentService>;

  beforeEach(async () => {
    mockNoiParcelService = createMock();
    mockNoiOwnerService = createMock();
    mockNoiDocService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ParcelComponent],
      providers: [
        {
          provide: NoticeOfIntentParcelService,
          useValue: mockNoiParcelService,
        },
        {
          provide: NoticeOfIntentOwnerService,
          useValue: mockNoiOwnerService,
        },
        {
          provide: NoticeOfIntentDocumentService,
          useValue: mockNoiDocService,
        },
        {
          provides: Router,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelComponent);
    component = fixture.componentInstance;
    component.$noticeOfIntentSubmission = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(
      undefined
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
