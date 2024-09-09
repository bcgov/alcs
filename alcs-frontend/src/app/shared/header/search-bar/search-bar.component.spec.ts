import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationService } from '../../../services/application/application.service';
import { SearchService } from '../../../services/search/search.service';
import { ToastService } from '../../../services/toast/toast.service';

import { SearchBarComponent } from './search-bar.component';
import { AuthenticationService, ICurrentUser } from '../../../services/authentication/authentication.service';
import { BehaviorSubject } from 'rxjs';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;
  let mockSearchService: DeepMocked<SearchService>;
  let mockAuthenticationService: DeepMocked<AuthenticationService>;
  let currentUser: BehaviorSubject<ICurrentUser | undefined>;

  beforeEach(async () => {
    mockSearchService = createMock();
    mockAuthenticationService = createMock();
    currentUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ApplicationService,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
      ],
      declarations: [SearchBarComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    mockAuthenticationService.$currentUser = currentUser;
    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
