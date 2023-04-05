import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../../services/application/application-detail.service';
import { ApplicationSubmissionService } from '../../../../services/application/application-submission/application-submission.service';
import { ApplicationDto } from '../../../../services/application/application.dto';
import { ToastService } from '../../../../services/toast/toast.service';

import { SubdProposalComponent } from './subd.component';

describe('SubdProposalComponent', () => {
  let component: SubdProposalComponent;
  let fixture: ComponentFixture<SubdProposalComponent>;
  let mockAppDetailService: DeepMocked<ApplicationDetailService>;
  let mockSubmissionService: DeepMocked<ApplicationSubmissionService>;

  beforeEach(async () => {
    mockAppDetailService = createMock();
    mockSubmissionService = createMock();

    mockAppDetailService.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationDetailService,
          useValue: mockAppDetailService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockSubmissionService,
        },
      ],
      declarations: [SubdProposalComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SubdProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
