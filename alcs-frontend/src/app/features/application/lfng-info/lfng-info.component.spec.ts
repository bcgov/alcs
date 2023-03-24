import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDocumentService } from '../../../services/application/application-document/application-document.service';
import { ApplicationReviewService } from '../../../services/application/application-review/application-review.service';
import { ApplicationDto } from '../../../services/application/application.dto';

import { LfngInfoComponent } from './lfng-info.component';

describe('LfngInfoComponent', () => {
  let component: LfngInfoComponent;
  let fixture: ComponentFixture<LfngInfoComponent>;
  let mockApplicationDetailService: DeepMocked<ApplicationDetailService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockApplicationReviewService: DeepMocked<ApplicationReviewService>;

  beforeEach(async () => {
    mockApplicationDetailService = createMock();
    mockAppDocumentService = createMock();
    mockApplicationReviewService = createMock();
    mockApplicationDetailService.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [LfngInfoComponent],
      providers: [
        {
          provide: ApplicationDetailService,
          useValue: mockApplicationDetailService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: ApplicationReviewService,
          useValue: mockApplicationReviewService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LfngInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
