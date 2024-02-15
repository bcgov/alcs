import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationBoundaryAmendmentService } from '../../../services/application/application-boundary-amendments/application-boundary-amendment.service';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationSubmissionStatusService } from '../../../services/application/application-submission-status/application-submission-status.service';
import { ApplicationTimelineService } from '../../../services/application/application-timeline/application-timeline.service';
import { ApplicationDto } from '../../../services/application/application.dto';

import { BoundaryAmendmentComponent } from './boundary-amendment.component';

describe('BoundaryAmendmentComponent', () => {
  let component: BoundaryAmendmentComponent;
  let fixture: ComponentFixture<BoundaryAmendmentComponent>;
  let mockAppDetailService: DeepMocked<ApplicationDetailService>;

  beforeEach(async () => {
    mockAppDetailService = createMock();
    mockAppDetailService.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationDetailService,
          useValue: mockAppDetailService,
        },
        {
          provide: ApplicationBoundaryAmendmentService,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      declarations: [BoundaryAmendmentComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BoundaryAmendmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
