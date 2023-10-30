import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../../../services/application/application-document/application-document.service';
import { ApplicationParcelService } from '../../../../../services/application/application-parcel/application-parcel.service';
import { ApplicationSubmissionService } from '../../../../../services/application/application-submission/application-submission.service';
import { CoveDetailsComponent } from './cove-details.component';

describe('CoveDetailsComponent', () => {
  let component: CoveDetailsComponent;
  let fixture: ComponentFixture<CoveDetailsComponent>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockAppParcelService: DeepMocked<ApplicationParcelService>;
  let mockAppSubService: DeepMocked<ApplicationSubmissionService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoveDetailsComponent],
      providers: [
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockAppParcelService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockAppSubService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CoveDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
