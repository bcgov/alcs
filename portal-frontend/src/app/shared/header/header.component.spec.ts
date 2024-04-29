import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { UserDto } from '../../services/authentication/authentication.dto';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { MaintenanceService } from '../../services/maintenance/maintenance.service';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockAuthService: DeepMocked<AuthenticationService>;
  let mockMaintenanceService: DeepMocked<MaintenanceService>;

  beforeEach(async () => {
    mockAuthService = createMock();
    mockAuthService.$currentProfile = new BehaviorSubject<UserDto | undefined>(undefined);
    mockMaintenanceService = createMock();

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
        {
          provide: MaintenanceService,
          useValue: mockMaintenanceService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
