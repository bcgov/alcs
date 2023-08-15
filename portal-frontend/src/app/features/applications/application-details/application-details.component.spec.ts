import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { CodeService } from '../../../services/code/code.service';
import { ToastService } from '../../../services/toast/toast.service';

import { ApplicationDetailsComponent } from './application-details.component';

describe('ApplicationDetailsComponent', () => {
  let component: ApplicationDetailsComponent;
  let fixture: ComponentFixture<ApplicationDetailsComponent>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockRouter: DeepMocked<Router>;
  let mockToastService: DeepMocked<ToastService>;
  let mockApplicationService: DeepMocked<ApplicationSubmissionService>;

  let applicationDocumentPipe = new BehaviorSubject<ApplicationDocumentDto[]>([]);

  beforeEach(async () => {
    mockCodeService = createMock();
    mockAppDocumentService = createMock();
    mockRouter = createMock();
    mockApplicationService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: ApplicationSubmissionService,
          useValue: mockApplicationService,
        },
      ],
      declarations: [ApplicationDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationDetailsComponent);
    component = fixture.componentInstance;
    component.$application = new BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>(undefined);
    component.$applicationDocuments = applicationDocumentPipe;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
