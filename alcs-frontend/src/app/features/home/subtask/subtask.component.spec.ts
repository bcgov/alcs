import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { CardSubtaskService } from '../../../services/card/card-subtask/card-subtask.service';
import { HomeService } from '../../../services/home/home.service';
import { UserService } from '../../../services/user/user.service';

import { SubtaskComponent } from './subtask.component';

describe('AuditComponent', () => {
  let component: SubtaskComponent;
  let fixture: ComponentFixture<SubtaskComponent>;
  let mockUserService: DeepMocked<UserService>;
  let mockAuthenticationService: DeepMocked<AuthenticationService>;
  let mockHomeService: DeepMocked<HomeService>;

  beforeEach(async () => {
    mockUserService = createMock();

    mockAuthenticationService = createMock();

    mockHomeService = createMock();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: CardSubtaskService,
          useValue: {},
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        { provide: HomeService, useValue: mockHomeService },
      ],
      declarations: [SubtaskComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SubtaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
