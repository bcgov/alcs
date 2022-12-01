import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService, ICurrentUser } from '../../services/authentication/authentication.service';
import { UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAuthService: DeepMocked<AuthenticationService>;
  let mockUserService: DeepMocked<UserService>;

  beforeEach(async () => {
    mockAuthService = createMock();
    mockAuthService.$currentUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);

    mockUserService = createMock();
    mockUserService.$userProfile = new BehaviorSubject<UserDto | undefined>({ prettyName: 'agent' } as UserDto);

    mockAuthService.getCurrentUser.mockReturnValue({
      name: 'agent',
      email: 'secret',
    });

    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
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
});
