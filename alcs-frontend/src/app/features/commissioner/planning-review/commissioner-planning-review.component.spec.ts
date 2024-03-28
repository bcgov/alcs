import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CommissionerService } from '../../../services/commissioner/commissioner.service';

import { CommissionerPlanningReviewComponent } from './commissioner-planning-review.component';

describe('CommissionerPlanningReviewComponent', () => {
  let component: CommissionerPlanningReviewComponent;
  let fixture: ComponentFixture<CommissionerPlanningReviewComponent>;
  let mockCommissionerService: DeepMocked<CommissionerService>;

  beforeEach(async () => {
    mockCommissionerService = createMock();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommissionerPlanningReviewComponent],
      providers: [
        {
          provide: CommissionerService,
          useValue: mockCommissionerService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CommissionerPlanningReviewComponent);
    component = fixture.componentInstance;

    mockCommissionerService.fetchApplication.mockResolvedValue({} as any);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
