import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationSubmissionService } from '../../../../services/application/application-submission/application-submission.service';
import { InclProposalComponent } from './incl.component';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDto } from '../../../../services/application/application.dto';

describe('InclProposalComponent', () => {
  let component: InclProposalComponent;
  let fixture: ComponentFixture<InclProposalComponent>;
  let mockApplicationDetailService: DeepMocked<ApplicationDetailService>;
  let mockAppSubmissionService: DeepMocked<ApplicationSubmissionService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockApplicationDetailService = createMock();
    mockToastService = createMock();
    mockAppSubmissionService = createMock();

    await TestBed.configureTestingModule({
      declarations: [InclProposalComponent],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        {
          provide: ApplicationDetailService,
          useValue: mockApplicationDetailService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppSubmissionService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    mockApplicationDetailService.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

    fixture = TestBed.createComponent(InclProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
