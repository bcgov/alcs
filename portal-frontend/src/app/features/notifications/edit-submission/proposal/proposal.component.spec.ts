import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { NotificationDocumentDto } from '../../../../services/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../../services/notification-document/notification-document.service';
import { NotificationSubmissionDetailedDto } from '../../../../services/notification-submission/notification-submission.dto';
import { NotificationSubmissionService } from '../../../../services/notification-submission/notification-submission.service';

import { ProposalComponent } from './proposal.component';

describe('ProposalComponent', () => {
  let component: ProposalComponent;
  let fixture: ComponentFixture<ProposalComponent>;
  let mockNotificationSubmissionService: DeepMocked<NotificationSubmissionService>;
  let mockNotificationDocumentService: DeepMocked<NotificationDocumentService>;
  let mockRouter: DeepMocked<Router>;

  let documentPipe = new BehaviorSubject<NotificationDocumentDto[]>([]);

  beforeEach(async () => {
    mockNotificationSubmissionService = createMock();
    mockRouter = createMock();
    mockNotificationDocumentService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: NotificationSubmissionService,
          useValue: mockNotificationSubmissionService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: NotificationDocumentService,
          useValue: mockNotificationDocumentService,
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      declarations: [ProposalComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalComponent);
    component = fixture.componentInstance;
    component.$notificationSubmission = new BehaviorSubject<NotificationSubmissionDetailedDto | undefined>(undefined);
    component.$notificationDocuments = documentPipe;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
