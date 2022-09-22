import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService, ICurrentUser } from '../../services/authentication/authentication.service';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAuthService: jasmine.SpyObj<AuthenticationService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj<AuthenticationService>('AuthenticationService', ['getCurrentUser']);
    mockAuthService.$currentUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);

    mockAuthService.getCurrentUser.and.returnValue({
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
