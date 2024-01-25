import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserDto } from '../../../services/authentication/authentication.dto';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { CodeService } from '../../../services/code/code.service';
import { InboxService } from '../../../services/inbox/inbox.service';
import { StatusService } from '../../../services/status/status.service';
import { ToastService } from '../../../services/toast/toast.service';

import { InboxComponent } from './inbox.component';

describe('InboxComponent', () => {
  let component: InboxComponent;
  let fixture: ComponentFixture<InboxComponent>;
  let mockInboxService: DeepMocked<InboxService>;
  let mockAuthService: DeepMocked<AuthenticationService>;
  let mockCodeService: DeepMocked<CodeService>;

  let activatedRoute: DeepMocked<ActivatedRoute>;

  beforeEach(async () => {
    mockInboxService = createMock();
    mockAuthService = createMock();
    mockCodeService = createMock();
    activatedRoute = createMock();

    mockAuthService.$currentProfile = new BehaviorSubject<UserDto | undefined>(undefined);
    Object.assign(activatedRoute, { paramMap: new Observable<ParamMap>() });

    await TestBed.configureTestingModule({
      imports: [MatAutocompleteModule],
      declarations: [InboxComponent],
      providers: [
        {
          provide: InboxService,
          useValue: mockInboxService,
        },
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
        {
          provide: StatusService,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InboxComponent);
    component = fixture.componentInstance;

    mockCodeService.loadCodes.mockResolvedValue({
      localGovernments: [],
      applicationTypes: [],
      decisionMakers: [],
      documentTypes: [],
      naruSubtypes: [],
      noticeOfIntentTypes: [],
      regions: [],
      submissionTypes: [],
    });

    mockInboxService.listStatuses.mockResolvedValue({
      application: [],
      noticeOfIntent: [],
      notification: [],
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
