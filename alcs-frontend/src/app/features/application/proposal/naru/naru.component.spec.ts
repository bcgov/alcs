import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationSubmissionService } from '../../../../services/application/application-submission/application-submission.service';
import { ApplicationDto } from '../../../../services/application/application.dto';
import { ToastService } from '../../../../services/toast/toast.service';

import { NaruProposalComponent } from './naru.component';

describe('NaruComponent', () => {
  let component: NaruProposalComponent;
  let fixture: ComponentFixture<NaruProposalComponent>;
  let mockApplicationDetailService: DeepMocked<ApplicationDetailService>;
  let mockToastService: DeepMocked<ToastService>;
  let mockApplicationSubmissionService: DeepMocked<ApplicationSubmissionService>;

  beforeEach(async () => {
    mockApplicationDetailService = createMock();
    mockToastService = createMock();
    mockApplicationSubmissionService = createMock();

    mockApplicationDetailService.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [NaruProposalComponent],
      providers: [
        {
          provide: ApplicationDetailService,
          useValue: mockApplicationDetailService,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationSubmissionService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NaruProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
