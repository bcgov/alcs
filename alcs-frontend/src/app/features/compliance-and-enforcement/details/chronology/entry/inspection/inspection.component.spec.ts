import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import moment from 'moment';
import { BehaviorSubject, of } from 'rxjs';
import {
  ComplianceAndEnforcementChronologyEntryDto,
  UpdateComplianceAndEnforcementChronologyEntryDto,
} from '../../../../../../services/compliance-and-enforcement/chronology/chronology.dto';
import { ComplianceAndEnforcementChronologyService } from '../../../../../../services/compliance-and-enforcement/chronology/chronology.service';
import { ComplianceAndEnforcementChronologyInspectionService } from '../../../../../../services/compliance-and-enforcement/chronology/inspection/inspection.service';
import {
  AllegedActivity,
  ComplianceAndEnforcementDto,
  InitialSubmissionType,
} from '../../../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { ComplianceAndEnforcementService } from '../../../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ComplianceAndEnforcementDocumentService } from '../../../../../../services/compliance-and-enforcement/documents/document.service';
import { ToastService } from '../../../../../../services/toast/toast.service';
import { UserDto } from '../../../../../../services/user/user.dto';
import { UserService } from '../../../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { ComplianceAndEnforcementChronologyComponent } from '../../chronology.component';
import { ComplianceAndEnforcementChronologyEntryInspectionComponent } from './inspection.component';

describe('ComplianceAndEnforcementChronologyComponent', () => {
  let component: ComplianceAndEnforcementChronologyEntryInspectionComponent;
  let fixture: ComponentFixture<ComplianceAndEnforcementChronologyEntryInspectionComponent>;
  let mockActivatedRoute: DeepMocked<ActivatedRoute>;
  let mockRouter: DeepMocked<Router>;
  let mockService: DeepMocked<ComplianceAndEnforcementChronologyInspectionService>;
  let mockComplianceAndEnforcementService: DeepMocked<ComplianceAndEnforcementService>;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockChronologyService: DeepMocked<ComplianceAndEnforcementChronologyService>;
  let mockDocumentService: DeepMocked<ComplianceAndEnforcementDocumentService>;
  let mockConfirmationDialogService: DeepMocked<ConfirmationDialogService>;
  let mockUserProfileSubject: BehaviorSubject<UserDto | undefined>;
  let mockUserService: DeepMocked<UserService>;
  let mockDialog: DeepMocked<MatDialog>;

  const mockUser: UserDto = {
    uuid: 'user-uuid',
    initials: 'JD',
    name: 'John Doe',
    identityProvider: 'IDIR',
    clientRoles: [],
    idirUserName: 'jd',
    bceidUserName: 'jd',
    prettyName: 'John Doe',
    settings: {
      favoriteBoards: [],
    },
  };
  const mockFile: ComplianceAndEnforcementDto = {
    uuid: 'file-uuid',
    fileNumber: 'file-number',
    dateSubmitted: 0,
    dateOpened: 0,
    dateClosed: 0,
    initialSubmissionType: InitialSubmissionType.COMPLAINT,
    allegedContraventionNarrative: 'abc',
    allegedActivity: [AllegedActivity.BREACH_OF_CONDITION, AllegedActivity.EXTRACTION],
    intakeNotes: 'abc',
    submitters: [],
    chronologyClosedAt: 0,
    chronologyClosedBy: mockUser,
    assignee: mockUser,
  };
  const mockUpdateChronologyEntryDto: UpdateComplianceAndEnforcementChronologyEntryDto = {
    isDraft: true,
    authorUuid: 'user-uuid',
    fileUuid: 'file-uuid',
  };
  const mockChronologyEntryDto: ComplianceAndEnforcementChronologyEntryDto = {
    uuid: 'entry-uuid',
    isDraft: true,
    date: 0,
    description: 'abc',
    author: mockUser,
    fileUuid: 'file-uuid',
    documents: [],
  };

  beforeEach(async () => {
    mockActivatedRoute = createMock<ActivatedRoute>();
    mockRouter = createMock<Router>();
    mockService = createMock<ComplianceAndEnforcementChronologyInspectionService>();
    mockToastService = createMock<ToastService>();
    mockHttpClient = createMock<HttpClient>();
    mockChronologyService = createMock<ComplianceAndEnforcementChronologyService>();
    mockDocumentService = createMock<ComplianceAndEnforcementDocumentService>();
    mockConfirmationDialogService = createMock<ConfirmationDialogService>();
    mockUserProfileSubject = new BehaviorSubject<UserDto | undefined>(undefined);
    mockUserService = createMock<UserService>({
      $userProfile: mockUserProfileSubject,
    });
    mockDialog = createMock<MatDialog>();

    TestBed.configureTestingModule({
      imports: [],
      declarations: [ComplianceAndEnforcementChronologyComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: ComplianceAndEnforcementChronologyInspectionService, useValue: mockService },
        { provide: ToastService, useValue: mockToastService },
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: ComplianceAndEnforcementChronologyService, useValue: mockChronologyService },
        { provide: ComplianceAndEnforcementDocumentService, useValue: mockDocumentService },
        { provide: ConfirmationDialogService, useValue: mockConfirmationDialogService },
        { provide: UserService, useValue: mockUserService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    });

    fixture = TestBed.createComponent(ComplianceAndEnforcementChronologyEntryInspectionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fillForm', () => {
    it('should populate form and attendees', () => {
      const inspection: any = {
        uuid: 'i-1',
        date: '2020-01-01',
        type: 'TYPE',
        allegedActivity: [AllegedActivity.EXTRACTION],
        officer: { uuid: 'o-1' },
        attendees: [{ name: 'A', organization: 'Org' }],
        comments: 'notes',
        documents: [],
      };

      component.fillForm(inspection, false);

      expect(component.form.controls.comments.value).toBe('notes');
      expect(component.form.controls.officerUuid.value).toBe('o-1');
      expect(component.form.controls.attendees.length).toBe(1);
    });
  });

  describe('dateText', () => {
    it('should return formatted date when entry date exists', () => {
      mockChronologyService.entriesByUuid.mockReturnValue(
        new Map([['entry-uuid', { date: 1609459200000 } as ComplianceAndEnforcementChronologyEntryDto]]),
      );
      component.entryUuid = 'entry-uuid';

      const txt = component.dateText();

      expect(txt).toBe('2020-12-31');
    });

    it('should return No Date when missing', () => {
      mockChronologyService.entriesByUuid.mockReturnValue(new Map());
      component.entryUuid = 'missing';

      expect(component.dateText()).toBe('No Date');
    });
  });

  describe('attendees', () => {
    it('should add and remove attendees', () => {
      component.addAttendee({ name: 'Name', organization: 'Org' }, false);
      expect(component.form.controls.attendees.length).toBe(1);

      component.removeAttendee(0);
      expect(component.form.controls.attendees.length).toBe(0);
    });
  });

  describe('dtoFromForm', () => {
    it('should map form values to dto', () => {
      component.form.patchValue({
        date: moment('2020-01-02'),
        type: 'TYPE',
        allegedActivity: [AllegedActivity.EXTRACTION],
        officerUuid: 'o-1',
        comments: 'c',
      } as any);
      component.addAttendee({ name: 'A', organization: 'Org' }, false);

      const dto = component.dtoFromForm(component.form.value as any, true);

      expect(dto.isDraft).toBe(true);
      expect(dto.date).toBe('2020-01-02');
      expect(dto.officerUuid).toBe('o-1');
      expect(dto.attendees?.length).toBe(1);
    });
  });

  describe('loadOfficers', () => {
    it('should load officers from user service', async () => {
      mockUserService.getComplianceAndEnforcementOfficers.mockResolvedValue([mockUser]);

      await component.loadOfficers();

      expect(component.officers.length).toBe(1);
      expect(component.officers[0].uuid).toBe('user-uuid');
    });
  });

  describe('onDeleteButtonClick', () => {
    it('should delete when confirmed', async () => {
      mockConfirmationDialogService.openDialog.mockReturnValue(of(true) as any);
      component.uuid = 'i-1';
      mockService.delete.mockReturnValue(of(''));

      await component.onDeleteButtonClick();

      expect(mockService.delete).toHaveBeenCalledWith('i-1');
      expect(mockToastService.showSuccessToast).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should not delete when not confirmed', async () => {
      mockConfirmationDialogService.openDialog.mockReturnValue(of(false) as any);

      await component.onDeleteButtonClick();

      expect(mockService.delete).not.toHaveBeenCalled();
    });
  });

  describe('openDocumentDialog', () => {
    it('should not open dialog when fileNumber missing', () => {
      component.fileNumber = undefined;

      component.openDocumentDialog();

      expect(mockDialog.open).not.toHaveBeenCalled();
    });

    it('should open dialog when fileNumber present', () => {
      component.fileNumber = 'file-1';
      const afterClosed = of(true);
      const dialogRef: any = { afterClosed: () => afterClosed };
      mockDialog.open.mockReturnValue(dialogRef as any);
      component.uuid = 'i-1';
      mockChronologyService.entriesByUuid.mockReturnValue(
        new Map([['entry-uuid', { uuid: 'entry-uuid' } as ComplianceAndEnforcementChronologyEntryDto]]),
      );
      component.entryUuid = 'entry-uuid';

      component.openDocumentDialog();

      expect(mockDialog.open).toHaveBeenCalled();
    });
  });

  describe('openAddCorrespondenceDialog', () => {
    it('should call openDocumentDialog', () => {
      const spy = jest.spyOn(component as any, 'openDocumentDialog');

      component.openAddCorrespondenceDialog('entry-uuid', 'i-1');

      expect(spy).toHaveBeenCalledWith({ chronologyEntryUuid: 'entry-uuid', inspectionUuid: 'i-1' });
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy subject', () => {
      const nextSpy = jest.spyOn(component.$destroy, 'next');
      const completeSpy = jest.spyOn(component.$destroy, 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
