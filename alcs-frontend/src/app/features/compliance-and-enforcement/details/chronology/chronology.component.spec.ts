import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject, of, throwError } from 'rxjs';
import {
  ComplianceAndEnforcementChronologyEntryDto,
  UpdateComplianceAndEnforcementChronologyEntryDto,
} from '../../../../services/compliance-and-enforcement/chronology/chronology.dto';
import { ComplianceAndEnforcementChronologyService } from '../../../../services/compliance-and-enforcement/chronology/chronology.service';
import {
  AllegedActivity,
  ComplianceAndEnforcementDto,
  InitialSubmissionType,
} from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { ComplianceAndEnforcementService } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ComplianceAndEnforcementDocumentService } from '../../../../services/compliance-and-enforcement/documents/document.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { findFileNumberInRouteTree } from '../../../../shared/utils/routing';
import { ComplianceAndEnforcementChronologyComponent } from './chronology.component';

describe('ComplianceAndEnforcementChronologyComponent', () => {
  let component: ComplianceAndEnforcementChronologyComponent;
  let fixture: ComponentFixture<ComplianceAndEnforcementChronologyComponent>;
  let mockActivatedRoute: DeepMocked<ActivatedRoute>;
  let mockRouter: DeepMocked<Router>;
  let mockFileSubject: BehaviorSubject<ComplianceAndEnforcementDto | null>;
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
    mockFileSubject = new BehaviorSubject<ComplianceAndEnforcementDto | null>(null);
    mockComplianceAndEnforcementService = createMock<ComplianceAndEnforcementService>({
      $file: mockFileSubject,
    });
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
      jest.spyOn(mockActivatedRoute.snapshot.paramMap, 'get').mockReturnValue('file-number');
      jest.spyOn(mockUserService, 'getComplianceAndEnforcementOfficers').mockResolvedValue([]);

      mockFileSubject.next(mockFile);
      fixture.detectChanges();

      expect(component.file).toEqual(mockFile);
    });

    it('should load current user profile', () => {
      jest.spyOn(mockActivatedRoute.snapshot.paramMap, 'get').mockReturnValue('file-number');
      jest.spyOn(mockUserService, 'getComplianceAndEnforcementOfficers').mockResolvedValue([]);

      mockUserProfileSubject.next(mockUser);
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
      jest.spyOn(mockChronologyService, 'createEntry').mockReturnValue(of(mockChronologyEntryDto));
      jest.spyOn(mockUserService, 'getComplianceAndEnforcementOfficers').mockResolvedValue([]);
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
      jest.spyOn(mockChronologyService, 'createEntry').mockReturnValue(throwError(() => new Error('API error')));

      await component.createDraftEntry();

      expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Failed to create draft entry.');
    });
  });

  describe('hasDraftEntries', () => {
    it('should return true when draft entries exist', () => {
      mockChronologyService.entriesByUuid.mockReturnValue(
        new Map<string, ComplianceAndEnforcementChronologyEntryDto>([
          ['1', { uuid: '1', isDraft: true } as ComplianceAndEnforcementChronologyEntryDto],
          ['2', { uuid: '2', isDraft: false } as ComplianceAndEnforcementChronologyEntryDto],
        ]),
      );

      expect(component.hasDraftEntries()).toBe(true);
    });

    it('should return false when no draft entries exist', () => {
      mockChronologyService.entriesByUuid.mockReturnValue(
        new Map<string, ComplianceAndEnforcementChronologyEntryDto>([
          ['1', { uuid: '1', isDraft: false } as ComplianceAndEnforcementChronologyEntryDto],
          ['2', { uuid: '2', isDraft: false } as ComplianceAndEnforcementChronologyEntryDto],
        ]),
      );

      expect(component.hasDraftEntries()).toBe(false);
    });

    it('should return false when entries array is empty', () => {
      mockChronologyService.entriesByUuid.mockReturnValue(
        new Map<string, ComplianceAndEnforcementChronologyEntryDto>([]),
      );

      expect(component.hasDraftEntries()).toBe(false);
    });
  });

  describe('datesInUse', () => {
    it('should return dates of all entries except excluded', () => {
      mockChronologyService.entriesByUuid.mockReturnValue(
        new Map<string, ComplianceAndEnforcementChronologyEntryDto>([
          ['1', { uuid: '1', date: 1000, isDraft: false } as ComplianceAndEnforcementChronologyEntryDto],
          ['2', { uuid: '2', date: 2000, isDraft: false } as ComplianceAndEnforcementChronologyEntryDto],
          ['3', { uuid: '3', date: 3000, isDraft: false } as ComplianceAndEnforcementChronologyEntryDto],
        ]),
      );

      const result = component.datesInUse('2');

      expect(result).toEqual([1000, 3000]);
    });

    it('should filter out null dates', () => {
      mockChronologyService.entriesByUuid.mockReturnValue(
        new Map<string, ComplianceAndEnforcementChronologyEntryDto>([
          ['1', { uuid: '1', date: 1000, isDraft: false } as ComplianceAndEnforcementChronologyEntryDto],
          ['2', { uuid: '2', date: null, isDraft: false } as ComplianceAndEnforcementChronologyEntryDto],
        ]),
      );

      const result = component.datesInUse('3');

      expect(result).toEqual([1000]);
    });
  });

  describe('findFileNumberInRouteTree', () => {
    it('should find file number in current route', () => {
      jest.spyOn(mockActivatedRoute.snapshot.paramMap, 'get').mockReturnValue('file-number');
      Object.defineProperty(mockActivatedRoute, 'parent', { value: null });

      const result = findFileNumberInRouteTree(mockActivatedRoute);

      expect(result).toBe('file-number');
    });

    it('should find file number in parent route', () => {
      const parentRoute = createMock<ActivatedRoute>();
      jest.spyOn(parentRoute.snapshot.paramMap, 'get').mockReturnValue('file-number');
      Object.defineProperty(parentRoute, 'parent', { value: null });
      jest.spyOn(mockActivatedRoute.snapshot.paramMap, 'get').mockReturnValue(null);
      Object.defineProperty(mockActivatedRoute, 'parent', { value: parentRoute });

      const result = findFileNumberInRouteTree(mockActivatedRoute);

      expect(result).toBe('file-number');
    });

    it('should throw error when file number not found', () => {
      jest.spyOn(mockActivatedRoute.snapshot.paramMap, 'get').mockReturnValue(null);
      Object.defineProperty(mockActivatedRoute, 'parent', { value: null });

      expect(() => findFileNumberInRouteTree(mockActivatedRoute)).toThrow('File number not found in route');
    });
  });

  describe('closeChronology', () => {
    beforeEach(() => {
      component.fileNumber = 'file-number';
      component.currentUserUuid = 'user-uuid';
    });

    it('should close chronology successfully', async () => {
      jest.spyOn(mockComplianceAndEnforcementService, 'update').mockReturnValue(of(mockFile));
      jest.spyOn(mockComplianceAndEnforcementService, 'loadFile').mockResolvedValue();

      await component.closeChronology();

      expect(mockComplianceAndEnforcementService.update).toHaveBeenCalled();
      expect(mockToastService.showSuccessToast).toHaveBeenCalledWith('Chronology closed successfully');
    });

    it('should handle error when closing chronology fails', async () => {
      jest
        .spyOn(mockComplianceAndEnforcementService, 'update')
        .mockReturnValue(throwError(() => new Error('API error')));

      await component.closeChronology();

      expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Unable to close chronology');
    });
  });

  describe('reopenChronology', () => {
    beforeEach(() => {
      component.fileNumber = 'file-number';
    });

    it('should reopen chronology successfully', async () => {
      jest.spyOn(mockComplianceAndEnforcementService, 'update').mockReturnValue(of(mockFile));
      jest.spyOn(mockComplianceAndEnforcementService, 'loadFile').mockResolvedValue();

      await component.reopenChronology();

      expect(mockComplianceAndEnforcementService.update).toHaveBeenCalled();
      expect(mockToastService.showSuccessToast).toHaveBeenCalledWith('Chronology re-opened successfully');
    });

    it('should handle error when reopening chronology fails', async () => {
      jest
        .spyOn(mockComplianceAndEnforcementService, 'update')
        .mockReturnValue(throwError(() => new Error('API error')));

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
