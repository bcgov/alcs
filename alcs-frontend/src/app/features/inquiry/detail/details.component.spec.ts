import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationRegionDto } from '../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentService } from '../../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../../services/application/application.service';
import { InquiryDetailService } from '../../../services/inquiry/inquiry-detail.service';
import { InquiryDto } from '../../../services/inquiry/inquiry.dto';
import { InquiryService } from '../../../services/inquiry/inquiry.service';

import { DetailsComponent } from './details.component';

describe('DetailsComponent', () => {
  let component: DetailsComponent;
  let fixture: ComponentFixture<DetailsComponent>;

  let inquiryDetailService: DeepMocked<InquiryDetailService>;
  let inquiryService: DeepMocked<InquiryService>;
  let applicationService: DeepMocked<ApplicationService>;
  let localGovernmentService: DeepMocked<ApplicationLocalGovernmentService>;

  beforeEach(async () => {
    inquiryDetailService = createMock();
    inquiryService = createMock();
    applicationService = createMock();
    localGovernmentService = createMock();

    localGovernmentService.list.mockResolvedValue([]);
    inquiryDetailService.$inquiry = new BehaviorSubject<InquiryDto | undefined>(undefined);
    applicationService.$applicationRegions = new BehaviorSubject<ApplicationRegionDto[]>([]);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: InquiryDetailService,
          useValue: inquiryDetailService,
        },
        {
          provide: InquiryService,
          useValue: inquiryService,
        },
        {
          provide: ApplicationService,
          useValue: applicationService,
        },
        {
          provide: ApplicationLocalGovernmentService,
          useValue: localGovernmentService,
        },
      ],
      declarations: [DetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
