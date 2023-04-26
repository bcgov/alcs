import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';
import { ParcelComponent } from './parcel.component';

describe('ParcelComponent', () => {
  let component: ParcelComponent;
  let fixture: ComponentFixture<ParcelComponent>;

  let mockApplicationParcelService: DeepMocked<ApplicationParcelService>;
  let mockAppOwnerService: DeepMocked<ApplicationOwnerService>;
  let mockAppDocService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockApplicationParcelService = createMock();
    mockAppOwnerService = createMock();
    mockAppDocService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ParcelComponent],
      providers: [
        {
          provide: ApplicationParcelService,
          useValue: mockApplicationParcelService,
        },
        {
          provide: ApplicationOwnerService,
          useValue: mockAppOwnerService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocService,
        },
        {
          provides: Router,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelComponent);
    component = fixture.componentInstance;
    component.$applicationSubmission = new BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>(
      {} as ApplicationSubmissionDetailedDto
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
