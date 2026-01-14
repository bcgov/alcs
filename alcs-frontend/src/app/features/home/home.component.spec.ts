import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService, ICurrentUser } from '../../services/authentication/authentication.service';
import { UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';
import { HomeComponent } from './home.component';
import { ComplianceAndEnforcementService } from '../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ToastService } from '../../services/toast/toast.service';
import { Router } from '@angular/router';
import { ComplianceAndEnforcementDto } from '../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAuthService: DeepMocked<AuthenticationService>;
  let mockUserService: DeepMocked<UserService>;
  let mockComplianceAndEnforcementService: DeepMocked<ComplianceAndEnforcementService>;
  let mockToastService: DeepMocked<ToastService>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(async () => {
    mockAuthService = createMock();
    mockAuthService.$currentUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);

    mockUserService = createMock();
    mockUserService.$userProfile = new BehaviorSubject<UserDto | undefined>({ prettyName: 'agent' } as UserDto);

    mockAuthService.getCurrentUser.mockReturnValue({
      name: 'agent',
      email: 'secret',
    });

    mockComplianceAndEnforcementService = createMock();
    mockToastService = createMock();
    mockRouter = createMock();

    await TestBed.configureTestingModule({
    declarations: [HomeComponent],
    imports: [RouterTestingModule],
    providers: [
        {
            provide: AuthenticationService,
            useValue: mockAuthService,
        },
        {
            provide: UserService,
            useValue: mockUserService,
        },
        {
            provide: ComplianceAndEnforcementService,
            useValue: mockComplianceAndEnforcementService,
        },
        {
            provide: ToastService,
            useValue: mockToastService,
        },
        {
            provide: Router,
            useValue: mockRouter,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show currently logged in user', () => {
    const compiled = fixture.debugElement.nativeElement;
    const welcomeTitle = compiled.querySelector('.welcome-title');
    expect(welcomeTitle).toBeTruthy();
    expect(welcomeTitle.textContent.trim()).toEqual('Welcome agent to ALCS');
  });

  describe('createComplianceAndEnforcementFile', () => {
    it('shows success toast if service create fails', async () => {
      mockComplianceAndEnforcementService.create.mockRejectedValue(new Error());

      await component.createComplianceAndEnforcementFile();

      expect(mockToastService.showErrorToast).toHaveBeenCalledWith('Failed to create C&E file draft');
    });

    it('shows error toast if service create fails', async () => {
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
      mockComplianceAndEnforcementService.create.mockResolvedValue({
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
      });

      await component.createComplianceAndEnforcementFile();

      expect(mockToastService.showSuccessToast).toHaveBeenCalledWith('C&E file draft created');
    });

    it('shows error toast if service create fails', async () => {
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
      const responseDto: ComplianceAndEnforcementDto = {
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

      mockComplianceAndEnforcementService.create.mockResolvedValue(responseDto);

      await component.createComplianceAndEnforcementFile();

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(
        `/compliance-and-enforcement/${responseDto.fileNumber}/draft`,
      );
    });
  });
});
