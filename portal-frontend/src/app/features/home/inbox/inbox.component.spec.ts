import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
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

  beforeEach(async () => {
    mockInboxService = createMock();
    mockAuthService = createMock();

    mockAuthService.$currentProfile = new BehaviorSubject<UserDto | undefined>(undefined);

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
          useValue: {},
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
