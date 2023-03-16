import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentService } from '../../services/application-document/application-document.service';
import { ApplicationProposalReviewDto } from '../../services/application-review/application-proposal-review.dto';
import { ApplicationProposalReviewService } from '../../services/application-review/application-proposal-review.service';
import { ApplicationProposalService } from '../../services/application/application-proposal.service';
import { ConfirmationDialogService } from '../../shared/confirmation-dialog/confirmation-dialog.service';

import { ViewApplicationComponent } from './view-application.component';

describe('ViewApplicationComponent', () => {
  let component: ViewApplicationComponent;
  let fixture: ComponentFixture<ViewApplicationComponent>;

  let mockRoute;
  let mockAppService: DeepMocked<ApplicationProposalService>;
  let mockAppReviewService: DeepMocked<ApplicationProposalReviewService>;
  let mockDialogService: DeepMocked<ConfirmationDialogService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;

  let routeParamMap: BehaviorSubject<Map<string, any>>;

  beforeEach(async () => {
    mockRoute = createMock();
    mockAppService = createMock();
    mockAppReviewService = createMock();
    mockAppDocumentService = createMock();

    mockAppReviewService.$applicationReview = new BehaviorSubject<ApplicationProposalReviewDto | undefined>(undefined);

    routeParamMap = new BehaviorSubject(new Map());
    mockRoute.paramMap = routeParamMap;

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockRoute,
        },
        {
          provide: ApplicationProposalService,
          useValue: mockAppService,
        },
        {
          provide: ApplicationProposalReviewService,
          useValue: mockAppReviewService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: ConfirmationDialogService,
          useValue: mockDialogService,
        },
      ],
      declarations: [ViewApplicationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
