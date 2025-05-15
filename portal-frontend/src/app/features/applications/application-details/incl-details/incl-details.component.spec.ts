import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { UserDto } from '../../../../services/authentication/authentication.dto';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { InclDetailsComponent } from './incl-details.component';
import { HttpClient } from '@angular/common/http';
import { DocumentService } from '../../../../services/document/document.service';

describe('InclDetailsComponent', () => {
  let component: InclDetailsComponent;
  let fixture: ComponentFixture<InclDetailsComponent>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockDocumentService: DeepMocked<DocumentService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockAuthService: DeepMocked<AuthenticationService>;

  beforeEach(async () => {
    mockHttpClient = createMock();
    mockDocumentService = createMock();
    mockAppDocumentService = createMock();
    mockAuthService = createMock();
    mockAuthService.$currentProfile = new BehaviorSubject<UserDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [InclDetailsComponent],
      providers: [
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InclDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
