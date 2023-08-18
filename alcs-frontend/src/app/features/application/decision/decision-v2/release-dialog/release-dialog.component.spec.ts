import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationStatusDto } from '../../../../../services/application/application-submission-status/application-submission-status.dto';
import { ApplicationService } from '../../../../../services/application/application.service';
import { ReleaseDialogComponent } from './release-dialog.component';
import { ApplicationDecisionV2Service } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApplicationDecisionDto } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';

describe('ReleaseDialogComponent', () => {
  let component: ReleaseDialogComponent;
  let fixture: ComponentFixture<ReleaseDialogComponent>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockApplicationDecisionV2Service: DeepMocked<ApplicationDecisionV2Service>;

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockApplicationService.$applicationStatuses = new BehaviorSubject<ApplicationStatusDto[]>([]);
    mockApplicationDecisionV2Service = createMock();
    mockApplicationDecisionV2Service.$decision = new BehaviorSubject<ApplicationDecisionDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ReleaseDialogComponent],
      providers: [
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: ApplicationDecisionV2Service,
          useValue: mockApplicationDecisionV2Service,
        },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReleaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
