import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject, Observable } from 'rxjs';
import { InquiryDetailService } from '../../services/inquiry/inquiry-detail.service';
import { InquiryDto } from '../../services/inquiry/inquiry.dto';

import { InquiryComponent } from './inquiry.component';

describe('InquiryComponent', () => {
  let component: InquiryComponent;
  let fixture: ComponentFixture<InquiryComponent>;
  let mockPlanningReviewDetailService: DeepMocked<InquiryDetailService>;
  let mockActivateRoute: DeepMocked<ActivatedRoute>;

  beforeEach(() => {
    mockPlanningReviewDetailService = createMock();
    mockActivateRoute = createMock();

    Object.assign(mockActivateRoute, { params: new Observable<ParamMap>() });
    mockPlanningReviewDetailService.$inquiry = new BehaviorSubject<InquiryDto | undefined>(undefined);

    TestBed.configureTestingModule({
      declarations: [InquiryComponent],
      providers: [
        {
          provide: InquiryDetailService,
          useValue: mockPlanningReviewDetailService,
        },
        {
          provide: ActivatedRoute,
          useValue: mockActivateRoute,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(InquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
