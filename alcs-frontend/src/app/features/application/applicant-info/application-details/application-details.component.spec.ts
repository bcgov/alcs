import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../../services/application/application-document/application-document.service';
import { SubmittedApplicationOwnerDto } from '../../../../services/application/application.dto';

import { ApplicationDetailsComponent } from './application-details.component';

describe('ApplicationDetailsComponent', () => {
  let component: ApplicationDetailsComponent;
  let fixture: ComponentFixture<ApplicationDetailsComponent>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockAppDocumentService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
      ],
      declarations: [ApplicationDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationDetailsComponent);
    component = fixture.componentInstance;
    component.submittedApplication = {
      parcels: [],
      otherParcels: [],
      documents: [],
      primaryContact: {
        type: {
          code: '',
        },
      } as SubmittedApplicationOwnerDto,
      parcelsAgricultureDescription: '',
      parcelsAgricultureImprovementDescription: '',
      parcelsNonAgricultureUseDescription: '',
      northLandUseType: '',
      northLandUseTypeDescription: '',
      eastLandUseType: '',
      eastLandUseTypeDescription: '',
      southLandUseType: '',
      southLandUseTypeDescription: '',
      westLandUseType: '',
      westLandUseTypeDescription: '',
      subdProposedLots: [],
      typeCode: '',
    };
    component.applicationType = 'NFUP';
    component.fileNumber = 'fake';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
