import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationOwnerService } from '../../../../services/application-owner/application-owner.service';
import { ApplicationSubmissionDetailedDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { UserDto } from '../../../../services/authentication/authentication.dto';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { NotificationSubmissionDetailedDto } from '../../../../services/notification-submission/notification-submission.dto';
import { NotificationSubmissionService } from '../../../../services/notification-submission/notification-submission.service';

import { PrimaryContactComponent } from './primary-contact.component';

describe('PrimaryContactComponent', () => {
  let component: PrimaryContactComponent;
  let fixture: ComponentFixture<PrimaryContactComponent>;
  let mockNotificationSubmissionService: DeepMocked<NotificationSubmissionService>;

  let applicationDocumentPipe = new BehaviorSubject<ApplicationDocumentDto[]>([]);

  beforeEach(async () => {
    mockNotificationSubmissionService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: NotificationSubmissionService,
          useValue: mockNotificationSubmissionService,
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      declarations: [PrimaryContactComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PrimaryContactComponent);
    component = fixture.componentInstance;
    component.$notificationSubmission = new BehaviorSubject<NotificationSubmissionDetailedDto | undefined>(undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
