import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { StartOfDayPipe } from '../../../shared/pipes/startOfDay.pipe';
import { OverviewComponent } from '../overview/overview.component';
import {
  ComplianceAndEnforcementDto,
  AllegedActivity,
  InitialSubmissionType,
} from '../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import moment from 'moment';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ComplianceAndEnforcementService } from '../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { UserDto } from '../../../services/user/user.dto';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('OverviewComponent', () => {
  const mockUser: UserDto = {
    uuid: '1234',
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
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let mockFile: ComplianceAndEnforcementDto = {
    uuid: '12345',
    fileNumber: '12345',
    dateSubmitted: 1,
    dateOpened: 1,
    dateClosed: 1,
    initialSubmissionType: InitialSubmissionType.COMPLAINT,
    allegedContraventionNarrative: 'Test narrative',
    allegedActivity: [AllegedActivity.OTHER],
    intakeNotes: 'Some notes',
    submitters: [],
    chronologyClosedAt: 0,
    chronologyClosedBy: mockUser,
    assignee: null,
  };
  let mockComplianceAndEnforcementService: DeepMocked<ComplianceAndEnforcementService>;
  let mockToastService: DeepMocked<ToastService>;

  beforeEach(async () => {
    mockComplianceAndEnforcementService = createMock();
    mockToastService = createMock();

    await TestBed.configureTestingModule({
    declarations: [OverviewComponent, StartOfDayPipe],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [],
    providers: [
        {
            provide: ComplianceAndEnforcementService,
            useValue: mockComplianceAndEnforcementService,
        },
        {
            provide: ToastService,
            useValue: mockToastService,
        },
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    paramMap: convertToParamMap({ fileNumber: '12345' }),
                },
            },
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form values and enable form when file input is set', () => {
    component.file = mockFile;

    expect(component.form.enabled).toBe(true);
    expect(component.form.value.dateSubmitted).toEqual(moment(mockFile.dateSubmitted));
    expect(component.form.value.initialSubmissionType).toBe(mockFile.initialSubmissionType);
    expect(component.form.value.allegedContraventionNarrative).toBe(mockFile.allegedContraventionNarrative);
    expect(component.form.value.allegedActivity).toEqual(mockFile.allegedActivity);
    expect(component.form.value.intakeNotes).toBe(mockFile.intakeNotes);
  });

  it('should not patch form if file input is undefined', () => {
    jest.spyOn(component.form, 'patchValue');

    component.file = undefined;

    expect(component.form.patchValue).not.toHaveBeenCalled();
  });

  it('should emit changes when form values change', (done) => {
    component.file = mockFile;

    component.$changes.subscribe((val) => {
      if (val.intakeNotes === 'Updated notes') {
        expect(val.intakeNotes).toBe('Updated notes');
        done();
      }
    });

    component.form.get('intakeNotes')?.setValue('Updated notes');
  });

  it('should complete $destroy on ngOnDestroy', () => {
    jest.spyOn(component.$destroy, 'next');
    jest.spyOn(component.$destroy, 'complete');

    component.ngOnDestroy();

    expect(component.$destroy.next).toHaveBeenCalled();
    expect(component.$destroy.complete).toHaveBeenCalled();
  });

  it('should not resubscribe to form valueChanges if already subscribed', () => {
    component.file = mockFile;
    jest.spyOn(component.form.valueChanges, 'pipe').mockImplementation(() => ({ subscribe: jest.fn() }) as any);
    component.file = mockFile; // set again, should not resubscribe

    expect(component.form.valueChanges.pipe).not.toHaveBeenCalled();
  });

  it('should initialize initialSubmissionTypes and allegedActivities arrays', () => {
    expect(Array.isArray(component.initialSubmissionTypes)).toBe(true);
    expect(Array.isArray(component.allegedActivities)).toBe(true);
    expect(component.initialSubmissionTypes.length).toBeGreaterThan(0);
    expect(component.allegedActivities.length).toBeGreaterThan(0);
  });

  it('should disable form controls by default', () => {
    Object.values(component.form.controls).forEach((control) => {
      expect(control.disabled).toBe(true);
    });
  });

  it('should enable all form controls when file is set', () => {
    component.file = mockFile;

    Object.values(component.form.controls).forEach((control) => {
      expect(control.enabled).toBe(true);
    });
  });

  it('should patch null dateSubmitted if file.dateSubmitted is missing', () => {
    const mockUser: UserDto = {
      uuid: '1234',
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
    component.file = {
      uuid: '12345',
      fileNumber: '12345',
      dateSubmitted: null,
      dateOpened: null,
      dateClosed: null,
      initialSubmissionType: null,
      allegedContraventionNarrative: '',
      allegedActivity: [],
      intakeNotes: '',
      submitters: [],
      chronologyClosedAt: 0,
      chronologyClosedBy: mockUser,
      assignee: null,
    };

    expect(component.form.value.dateSubmitted).toBeNull();
  });

  it('should emit changes with correct types when form changes', (done) => {
    component.file = mockFile;

    component.$changes.subscribe((val) => {
      expect(typeof val.intakeNotes).toBe('string');
      done();
    });

    component.form.get('intakeNotes')?.setValue('Another note');
  });

  it('should not throw if ngOnDestroy is called multiple times', () => {
    expect(() => {
      component.ngOnDestroy();
      component.ngOnDestroy();
    }).not.toThrow();
  });
});
