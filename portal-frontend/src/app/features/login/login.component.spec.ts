import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { UserDto } from '../../services/authentication/authentication.dto';
import { AuthenticationService } from '../../services/authentication/authentication.service';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: DeepMocked<AuthenticationService>;

  beforeEach(async () => {
    mockAuthService = createMock();
    mockAuthService.$currentProfile = new BehaviorSubject<UserDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
