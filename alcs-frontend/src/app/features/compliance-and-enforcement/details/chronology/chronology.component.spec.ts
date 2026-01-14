import { ComplianceAndEnforcementService } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComplianceAndEnforcementChronologyComponent } from './chronology.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../services/toast/toast.service';
import { HttpClient } from '@angular/common/http';
import { ComplianceAndEnforcementChronologyService } from '../../../../services/compliance-and-enforcement/chronology/chronology.service';
import { ComplianceAndEnforcementDocumentService } from '../../../../services/compliance-and-enforcement/documents/document.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { UserService } from '../../../../services/user/user.service';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of, throwError } from 'rxjs';
import {
  AllegedActivity,
  ComplianceAndEnforcementDto,
  InitialSubmissionType,
} from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { UserDto } from '../../../../services/user/user.dto';
import {
  ComplianceAndEnforcementChronologyEntryDto,
  UpdateComplianceAndEnforcementChronologyEntryDto,
} from '../../../../services/compliance-and-enforcement/chronology/chronology.dto';

describe('ComplianceAndEnforcementChronologyComponent', () => {
  let component: ComplianceAndEnforcementChronologyComponent;
  let fixture: ComponentFixture<ComplianceAndEnforcementChronologyComponent>;
  let mockActivatedRoute: DeepMocked<ActivatedRoute>;
  let mockRouter: DeepMocked<Router>;
  let mockComplianceAndEnforcementService: DeepMocked<ComplianceAndEnforcementService>;
  let mockToastService: DeepMocked<ToastService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockChronologyService: DeepMocked<ComplianceAndEnforcementChronologyService>;
  let mockDocumentService: DeepMocked<ComplianceAndEnforcementDocumentService>;
  let mockConfirmationDialogService: DeepMocked<ConfirmationDialogService>;
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
    mockComplianceAndEnforcementService = createMock<ComplianceAndEnforcementService>();
    mockToastService = createMock<ToastService>();
    mockHttpClient = createMock<HttpClient>();
    mockChronologyService = createMock<ComplianceAndEnforcementChronologyService>();
    mockDocumentService = createMock<ComplianceAndEnforcementDocumentService>();
    mockConfirmationDialogService = createMock<ConfirmationDialogService>();
    mockUserService = createMock<UserService>();
    mockDialog = createMock<MatDialog>();

    mockComplianceAndEnforcementService.$file = new BehaviorSubject<ComplianceAndEnforcementDto | null>(null);
    mockUserService.$userProfile = new BehaviorSubject<UserDto | undefined>(undefined);

    TestBed.configureTestingModule({
      imports: [],
      declarations: [ComplianceAndEnforcementChronologyComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: ComplianceAndEnforcementService, useValue: mockComplianceAndEnforcementService },
        { provide: ToastService, useValue: mockToastService },
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: ComplianceAndEnforcementChronologyService, useValue: mockChronologyService },
        { provide: ComplianceAndEnforcementDocumentService, useValue: mockDocumentService },
        { provide: ConfirmationDialogService, useValue: mockConfirmationDialogService },
        { provide: UserService, useValue: mockUserService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    });

    fixture = TestBed.createComponent(ComplianceAndEnforcementChronologyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load file from observable', () => {
      mockComplianceAndEnforcementService.$file = new BehaviorSubject<ComplianceAndEnforcementDto | null>(mockFile);
      mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue('file-number');
      mockChronologyService.entriesByFileId = jest.fn().mockReturnValue(of([]));
      mockUserService.getComplianceAndEnforcementOfficers = jest.fn().mockResolvedValue([]);

      fixture.detectChanges();

      expect(component.file).toEqual(mockFile);
    });

    it('should load current user profile', () => {
      mockUserService.$userProfile = new BehaviorSubject<UserDto | undefined>(mockUser);
      mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue('file-number');
      mockChronologyService.entriesByFileId = jest.fn().mockReturnValue(of([]));
      mockUserService.getComplianceAndEnforcementOfficers = jest.fn().mockResolvedValue([]);

      fixture.detectChanges();

      expect(component.currentUserUuid).toEqual('user-uuid');
    });
  });

  describe('createDraftEntry', () => {
    beforeEach(() => {
      component.file = mockFile;
      component.currentUserUuid = 'user-uuid';
      component.fileNumber = 'file-number';
    });

    it('should create a draft entry successfully', async () => {
      mockChronologyService.createEntry = jest.fn().mockReturnValue(of(mockChronologyEntryDto));
      mockChronologyService.entriesByFileId = jest.fn().mockReturnValue(of([]));
      mockUserService.getComplianceAndEnforcementOfficers = jest.fn().mockResolvedValue([]);
      component.file = mockFile;
      component.currentUserUuid = 'user-uuid';

      await component.createDraftEntry();

      expect(mockChronologyService.createEntry).toHaveBeenCalledWith(mockUpdateChronologyEntryDto);
      expect(mockToastService.showSuccessToast).toHaveBeenCalledWith('Draft entry created successfully.');
    });

    it('should show error when file uuid is missing', async () => {
      component.file = undefined;

      await component.createDraftEntry();

      expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Failed to create draft entry');
    });

    it('should handle error when creating draft entry fails', async () => {
      mockChronologyService.createEntry = jest.fn().mockReturnValue(throwError(() => new Error('API error')));

      await component.createDraftEntry();

      expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Failed to create draft entry.');
    });
  });

  describe('hasDraftEntries', () => {
    it('should return true when draft entries exist', () => {
      component.entries = [
        { isDraft: true, uuid: '1' },
        { isDraft: false, uuid: '2' },
      ] as ComplianceAndEnforcementChronologyEntryDto[];

      expect(component.hasDraftEntries()).toBe(true);
    });

    it('should return false when no draft entries exist', () => {
      component.entries = [
        { isDraft: false, uuid: '1' },
        { isDraft: false, uuid: '2' },
      ] as ComplianceAndEnforcementChronologyEntryDto[];

      expect(component.hasDraftEntries()).toBe(false);
    });

    it('should return false when entries array is empty', () => {
      component.entries = [];

      expect(component.hasDraftEntries()).toBe(false);
    });
  });

  describe('setDraft', () => {
    beforeEach(() => {
      component.fileNumber = 'file-number';
    });

    it('should set entry as draft successfully', async () => {
      mockChronologyService.updateEntry = jest.fn().mockReturnValue(of({}));
      mockChronologyService.entriesByFileId = jest.fn().mockReturnValue(of([]));
      mockUserService.getComplianceAndEnforcementOfficers = jest.fn().mockResolvedValue([]);

      await component.setDraft('entry-uuid');

      expect(mockChronologyService.updateEntry).toHaveBeenCalledWith('entry-uuid', { isDraft: true });
    });

    it('should handle error when setting draft fails', async () => {
      mockChronologyService.updateEntry = jest.fn().mockReturnValue(throwError(() => new Error('API error')));

      await component.setDraft('entry-uuid');

      expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Failed to set draft entry.');
    });
  });

  describe('completeDraftEntry', () => {
    beforeEach(() => {
      component.fileNumber = 'file-number';
    });

    it('should complete draft entry successfully', async () => {
      mockChronologyService.updateEntry = jest.fn().mockReturnValue(of({}));
      mockChronologyService.entriesByFileId = jest.fn().mockReturnValue(of([]));
      mockUserService.getComplianceAndEnforcementOfficers = jest.fn().mockResolvedValue([]);

      await component.completeDraftEntry({ uuid: 'entry-uuid', updateDto: mockUpdateChronologyEntryDto });

      expect(mockChronologyService.updateEntry).toHaveBeenCalledWith('entry-uuid', mockUpdateChronologyEntryDto);
      expect(mockToastService.showSuccessToast).toHaveBeenCalledWith('Entry completed successfully.');
    });

    it('should handle error when completing draft entry fails', async () => {
      mockChronologyService.updateEntry = jest.fn().mockReturnValue(throwError(() => new Error('API error')));

      await component.completeDraftEntry({ uuid: 'entry-uuid', updateDto: {} });

      expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Failed to complete draft entry.');
    });
  });

  describe('confirmEntryDelete', () => {
    beforeEach(() => {
      component.fileNumber = 'file-number';
    });

    it('should delete entry when user confirms', (done) => {
      mockConfirmationDialogService.openDialog = jest.fn().mockReturnValue(of(true));
      mockChronologyService.deleteEntry = jest.fn().mockReturnValue(of({}));
      mockChronologyService.entriesByFileId = jest.fn().mockReturnValue(of([]));
      mockUserService.getComplianceAndEnforcementOfficers = jest.fn().mockResolvedValue([]);

      component.confirmEntryDelete('entry-uuid');

      setTimeout(() => {
        expect(mockChronologyService.deleteEntry).toHaveBeenCalledWith('entry-uuid');
        expect(mockToastService.showSuccessToast).toHaveBeenCalledWith('Entry deleted successfully.');
        done();
      }, 0);
    });

    it('should not delete entry when user declines', (done) => {
      mockConfirmationDialogService.openDialog = jest.fn().mockReturnValue(of(false));
      mockChronologyService.deleteEntry = jest.fn();

      component.confirmEntryDelete('entry-uuid');

      setTimeout(() => {
        expect(mockChronologyService.deleteEntry).not.toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe('datesInUse', () => {
    it('should return dates of all entries except excluded', () => {
      component.entries = [
        { uuid: '1', date: 1000, isDraft: false },
        { uuid: '2', date: 2000, isDraft: false },
        { uuid: '3', date: 3000, isDraft: false },
      ] as ComplianceAndEnforcementChronologyEntryDto[];

      const result = component.datesInUse('2');

      expect(result).toEqual([1000, 3000]);
    });

    it('should filter out null dates', () => {
      component.entries = [
        { uuid: '1', date: 1000, isDraft: false },
        { uuid: '2', date: null, isDraft: false },
      ] as ComplianceAndEnforcementChronologyEntryDto[];

      const result = component.datesInUse('3');

      expect(result).toEqual([1000]);
    });
  });

  describe('findFileNumberInRouteTree', () => {
    it('should find file number in current route', () => {
      mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue('file-number');
      Object.defineProperty(mockActivatedRoute, 'parent', { value: null });

      const result = component.findFileNumberInRouteTree(mockActivatedRoute);

      expect(result).toBe('file-number');
    });

    it('should find file number in parent route', () => {
      const parentRoute = createMock<ActivatedRoute>();
      parentRoute.snapshot.paramMap.get = jest.fn().mockReturnValue('file-number');
      Object.defineProperty(parentRoute, 'parent', { value: null });
      mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue(null);
      Object.defineProperty(mockActivatedRoute, 'parent', { value: parentRoute });

      const result = component.findFileNumberInRouteTree(mockActivatedRoute);

      expect(result).toBe('file-number');
    });

    it('should throw error when file number not found', () => {
      mockActivatedRoute.snapshot.paramMap.get = jest.fn().mockReturnValue(null);
      Object.defineProperty(mockActivatedRoute, 'parent', { value: null });

      expect(() => component.findFileNumberInRouteTree(mockActivatedRoute)).toThrow('File number not found in route');
    });
  });

  describe('closeChronology', () => {
    beforeEach(() => {
      component.fileNumber = 'file-number';
      component.currentUserUuid = 'user-uuid';
    });

    it('should close chronology successfully', async () => {
      mockComplianceAndEnforcementService.update = jest.fn().mockReturnValue(of({}));
      mockComplianceAndEnforcementService.loadFile = jest.fn();

      await component.closeChronology();

      expect(mockComplianceAndEnforcementService.update).toHaveBeenCalled();
      expect(mockToastService.showSuccessToast).toHaveBeenCalledWith('Chronology closed successfully');
    });

    // it('should handle error when closing chronology fails', async () => {
    //   mockComplianceAndEnforcementService.update = jest.fn().mockReturnValue(throwError(() => new Error('API error')));

    //   await component.closeChronology();

    //   expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Unable to close chronology');
    // });
  });

  describe('reopenChronology', () => {
    beforeEach(() => {
      component.fileNumber = 'file-number';
    });

    it('should reopen chronology successfully', async () => {
      mockComplianceAndEnforcementService.update = jest.fn().mockReturnValue(of({}));
      mockComplianceAndEnforcementService.loadFile = jest.fn();

      await component.reopenChronology();

      expect(mockComplianceAndEnforcementService.update).toHaveBeenCalled();
      expect(mockToastService.showSuccessToast).toHaveBeenCalledWith('Chronology re-opened successfully');
    });

    it('should handle error when reopening chronology fails', async () => {
      mockComplianceAndEnforcementService.update = jest.fn().mockReturnValue(throwError(() => new Error('API error')));

      await component.reopenChronology();

      expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Unable to re-open chronology');
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
