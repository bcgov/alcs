import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { LandUseComponent } from './land-use.component';

describe('LandUseComponent', () => {
  let component: LandUseComponent;
  let fixture: ComponentFixture<LandUseComponent>;
  let mockAppService: DeepMocked<NoticeOfIntentSubmissionService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockRouter: DeepMocked<Router>;
  let noiPipe = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(undefined);

  beforeEach(async () => {
    mockAppService = createMock();
    mockHttpClient = createMock();
    mockRouter = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: NoticeOfIntentSubmissionService,
          useValue: mockAppService,
        },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
      ],
      declarations: [LandUseComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LandUseComponent);
    component = fixture.componentInstance;
    component.$noiSubmission = noiPipe;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
