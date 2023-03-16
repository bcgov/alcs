import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationProposalDetailedDto } from '../../../services/application/application-proposal.dto';
import { ApplicationProposalService } from '../../../services/application/application-proposal.service';
import { ToastService } from '../../../services/toast/toast.service';

import { ReviewAndSubmitComponent } from './review-and-submit.component';

describe('ReviewAndSubmitComponent', () => {
  let component: ReviewAndSubmitComponent;
  let fixture: ComponentFixture<ReviewAndSubmitComponent>;
  let mockToastService: DeepMocked<ToastService>;
  let mockRouter: DeepMocked<Router>;
  let mockApplicationService: DeepMocked<ApplicationProposalService>;

  beforeEach(async () => {
    mockToastService = createMock();
    mockRouter = createMock();
    mockApplicationService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ReviewAndSubmitComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: ApplicationProposalService,
          useValue: mockApplicationService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewAndSubmitComponent);
    component = fixture.componentInstance;
    component.$application = new BehaviorSubject<ApplicationProposalDetailedDto | undefined>(undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
