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
import { NoticeType } from '../../../../../../services/compliance-and-enforcement/chronology/notice/notice.dto';
import { ComplianceAndEnforcementNoticeService } from '../../../../../../services/compliance-and-enforcement/chronology/notice/notice.service';
import {
  AllegedActivity,
  ComplianceAndEnforcementDto,
  InitialSubmissionType,
} from '../../../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { ComplianceAndEnforcementService } from '../../../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ComplianceAndEnforcementDocumentService } from '../../../../../../services/compliance-and-enforcement/documents/document.service';
import { ResponsiblePartiesService } from '../../../../../../services/compliance-and-enforcement/responsible-parties/responsible-parties.service';
import { ToastService } from '../../../../../../services/toast/toast.service';
import { UserDto } from '../../../../../../services/user/user.dto';
import { UserService } from '../../../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { ComplianceAndEnforcementChronologyComponent } from '../../chronology.component';
import { ComplianceAndEnforcementNoticeComponent } from './notice.component';

describe('ComplianceAndEnforcementChronologyComponent', () => {
  let component: ComplianceAndEnforcementNoticeComponent;
  let fixture: ComponentFixture<ComplianceAndEnforcementNoticeComponent>;
  let mockActivatedRoute: DeepMocked<ActivatedRoute>;
  let mockRouter: DeepMocked<Router>;
  let mockService: DeepMocked<ComplianceAndEnforcementNoticeService>;
  let mockComplianceAndEnforcementService: DeepMocked<ComplianceAndEnforcementService>;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockChronologyService: DeepMocked<ComplianceAndEnforcementChronologyService>;
  let mockDocumentService: DeepMocked<ComplianceAndEnforcementDocumentService>;
  let mockConfirmationDialogService: DeepMocked<ConfirmationDialogService>;
  let mockUserProfileSubject: BehaviorSubject<UserDto | undefined>;
  let mockUserService: DeepMocked<UserService>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockResponsiblePartiesService: DeepMocked<ResponsiblePartiesService>;

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
    mockService = createMock<ComplianceAndEnforcementNoticeService>();
    mockToastService = createMock<ToastService>();
    mockHttpClient = createMock<HttpClient>();
    mockChronologyService = createMock<ComplianceAndEnforcementChronologyService>();
    mockResponsiblePartiesService = createMock<ResponsiblePartiesService>();
    mockDocumentService = createMock<ComplianceAndEnforcementDocumentService>();
    mockConfirmationDialogService = createMock<ConfirmationDialogService>();
    mockUserProfileSubject = new BehaviorSubject<UserDto | undefined>(undefined);
    mockUserService = createMock<UserService>({
      $userProfile: mockUserProfileSubject,
    });
    mockDialog = createMock<MatDialog>();

    TestBed.configureTestingModule({
      imports: [],
      declarations: [ComplianceAndEnforcementChronologyComponent, ComplianceAndEnforcementNoticeComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: ComplianceAndEnforcementNoticeService, useValue: mockService },
        { provide: ToastService, useValue: mockToastService },
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: ComplianceAndEnforcementChronologyService, useValue: mockChronologyService },
        { provide: ResponsiblePartiesService, useValue: mockResponsiblePartiesService },
        { provide: ComplianceAndEnforcementDocumentService, useValue: mockDocumentService },
        { provide: ConfirmationDialogService, useValue: mockConfirmationDialogService },
        { provide: UserService, useValue: mockUserService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    });

    fixture = TestBed.createComponent(ComplianceAndEnforcementNoticeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  describe('form and helpers', () => {
    it('fillForm populates controls from notice', () => {
      const notice: any = {
        date: '2020-01-02',
        type: NoticeType.COMPLIANCE_NOTICE,
        allegedActivity: [AllegedActivity.EXTRACTION],
        issuedToIndividualResponsiblePartyUuid: 'issuee-1',
        notifications: [],
      };

      component.fillForm(notice, false);

      expect(component.form.controls.type.value).toEqual(NoticeType.COMPLIANCE_NOTICE);
      expect(component.form.controls.allegedActivity.value).toEqual([AllegedActivity.EXTRACTION]);
      expect(component.form.controls.issuedToUuid.value).toEqual('issuee-1');
      expect(component.form.controls.date.value).not.toBeNull();
      expect(component.form.controls.date.value!.format('YYYY-MM-DD')).toEqual('2020-01-02');
    });

    it('dtoFromForm converts form to DTO including notifications and issuee mapping', () => {
      // prepare an issuee that matches the issuedToUuid
      component.issuees.set([
        { uuid: 'issuee-1', type: 'Individual Responsible Party', name: 'X', organization: null },
      ] as any);

      // populate form
      component.form.controls.date.setValue(moment('2020-02-02'));
      component.form.controls.type.setValue(NoticeType.COMPLIANCE_NOTICE);
      component.form.controls.allegedActivity.setValue([AllegedActivity.EXTRACTION]);
      component.form.controls.issuedToUuid.setValue('issuee-1');

      const notifiedControls = component.form.controls.notifiedBy.controls as any;
      const firstMethod = Object.keys(notifiedControls)[0];
      notifiedControls[firstMethod].controls.wasNotified.patchValue(true);
      notifiedControls[firstMethod].controls.on.patchValue('2020-03-03');

      const dto = component.dtoFromForm(component.form.value as any, false);

      expect(dto.date).toEqual('2020-02-02');
      expect(dto.type).toEqual(NoticeType.COMPLIANCE_NOTICE);
      expect(dto.allegedActivity).toEqual([AllegedActivity.EXTRACTION]);
      expect(dto.issuedToIndividualResponsiblePartyUuid).toEqual('issuee-1');
      expect(dto.notifications).toHaveLength(1);
      expect(dto.notifications?.[0]).toBeDefined();
      expect(dto.notifications?.[0].method).toEqual(firstMethod);
      expect(dto.notifications?.[0].date).toEqual('2020-03-03');
    });

    it('entryDateText returns formatted date or No Date', () => {
      const dateString = '2020-Apr-05';
      const timestamp = moment(dateString).toDate().getTime();
      mockChronologyService.entriesByUuid.mockReturnValue(
        new Map<string, ComplianceAndEnforcementChronologyEntryDto>([
          [
            'entry-uuid',
            { date: timestamp, uuid: 'entry-uuid' } as unknown as ComplianceAndEnforcementChronologyEntryDto,
          ],
        ]),
      );

      component.entryUuid = 'entry-uuid';

      expect(component.entryDateText()).toEqual(dateString);
    });

    it('notification helpers work as expected', () => {
      const notifiedControls = component.form.controls.notifiedBy.controls as any;
      const firstMethod = Object.keys(notifiedControls)[0];

      // initially false
      expect(component.notificationMethodChecked(firstMethod)).toBeFalsy();

      // set and check
      notifiedControls[firstMethod].controls.wasNotified.patchValue(true);
      notifiedControls[firstMethod].controls.on.patchValue('2020-06-06');

      expect(component.notificationMethodChecked(firstMethod)).toBeTruthy();
      const ts = component.notificationDateTimestamp(firstMethod);
      expect(ts).toEqual(moment('2020-06-06').toDate().getTime());

      component.onNotificationDateSave(firstMethod, moment('2020-06-06').toDate().getTime());
      expect(notifiedControls[firstMethod].controls.on.getRawValue()).toEqual('2020-06-06');

      expect(component.formattedDate('2020-06-06')).toEqual(moment('2020-06-06').format('YYYY-MMM-DD'));
    });
  });

  describe('actions and dialog guards', () => {
    it('loadResponsibleParties shows error toast when no fileNumber', async () => {
      component.fileNumber = undefined;

      await component.loadResponsibleParties();

      expect(mockToastService.showErrorToast).toHaveBeenCalledWith('There was a problem loading responsible parties');
    });

    it('openDocumentDialog does not open dialog when fileNumber missing', () => {
      component.fileNumber = undefined;

      const openSpy = jest.spyOn(mockDialog, 'open');

      component.openAddDocumentDialog(undefined, undefined);

      expect(openSpy).not.toHaveBeenCalled();
    });

    it('onDeleteButtonClick does nothing when confirmation declined', () => {
      mockConfirmationDialogService.openDialog.mockReturnValue(of(false) as any);

      component.uuid = 'some-uuid';

      component.onDeleteButtonClick();

      expect(mockService.delete).not.toHaveBeenCalled();
    });

    it('onDeleteButtonClick deletes and navigates when confirmed', async () => {
      mockConfirmationDialogService.openDialog.mockReturnValue(of(true) as any);
      mockService.delete.mockReturnValue(of('some-uuid') as any);
      component.uuid = 'some-uuid';

      component.onDeleteButtonClick();

      // wait for microtasks spawned by subscribe async handler
      await new Promise((r) => setTimeout(r, 0));

      expect(mockService.delete).toHaveBeenCalledWith('some-uuid');
      expect(mockToastService.showSuccessToast).toHaveBeenCalledWith('Entry deleted successfully.');
      expect(mockRouter.navigate).toHaveBeenCalled();
    });
  });
});
