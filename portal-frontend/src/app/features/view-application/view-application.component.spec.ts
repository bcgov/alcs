import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationReviewService } from '../../services/application-review/application-review.service';
import { ApplicationService } from '../../services/application/application.service';
import { ConfirmationDialogService } from '../../shared/confirmation-dialog/confirmation-dialog.service';

import { ViewApplicationComponent } from './view-application.component';

describe('ViewApplicationComponent', () => {
  let component: ViewApplicationComponent;
  let fixture: ComponentFixture<ViewApplicationComponent>;

  let mockRoute;
  let mockAppService: DeepMocked<ApplicationService>;
  let mockAppReviewService: DeepMocked<ApplicationReviewService>;
  let mockDialogService: DeepMocked<ConfirmationDialogService>;

  let routeParamMap: BehaviorSubject<Map<string, any>>;

  beforeEach(async () => {
    mockRoute = createMock();
    mockAppService = createMock();
    mockAppReviewService = createMock();

    routeParamMap = new BehaviorSubject(new Map());
    mockRoute.paramMap = routeParamMap;

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockRoute,
        },
        {
          provide: ApplicationService,
          useValue: mockAppService,
        },
        {
          provide: ApplicationReviewService,
          useValue: mockAppReviewService,
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
