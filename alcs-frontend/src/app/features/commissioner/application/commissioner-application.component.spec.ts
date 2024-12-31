import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CommissionerService } from '../../../services/commissioner/commissioner.service';

import { CommissionerApplicationComponent } from './commissioner-application.component';
import { ApplicationSubmissionStatusService } from '../../../services/application/application-submission-status/application-submission-status.service';

describe('CommissionerApplicationComponent', () => {
  let component: CommissionerApplicationComponent;
  let fixture: ComponentFixture<CommissionerApplicationComponent>;
  let mockCommissionerService: DeepMocked<CommissionerService>;
  let mockApplicationSubmissionStatusService: DeepMocked<ApplicationSubmissionStatusService>;

  beforeEach(async () => {
    mockCommissionerService = createMock();
    mockApplicationSubmissionStatusService = createMock();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommissionerApplicationComponent],
      providers: [
        {
          provide: CommissionerService,
          useValue: mockCommissionerService,
        },
        {
          provide: ApplicationSubmissionStatusService,
          useValue: mockApplicationSubmissionStatusService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CommissionerApplicationComponent);
    component = fixture.componentInstance;

    mockCommissionerService.fetchApplication.mockResolvedValue({} as any);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
