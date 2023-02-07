import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';

import { PrimaryContactComponent } from './primary-contact.component';

describe('PrimaryContactComponent', () => {
  let component: PrimaryContactComponent;
  let fixture: ComponentFixture<PrimaryContactComponent>;
  let mockAppService: DeepMocked<ApplicationService>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockAppOwnerService: DeepMocked<ApplicationOwnerService>;

  beforeEach(async () => {
    mockAppService = createMock();
    mockAppDocumentService = createMock();
    mockAppOwnerService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationService,
          useValue: mockAppService,
        },
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: ApplicationOwnerService,
          useValue: mockAppOwnerService,
        },
      ],
      declarations: [PrimaryContactComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PrimaryContactComponent);
    component = fixture.componentInstance;
    component.$application = new BehaviorSubject<ApplicationDetailedDto | undefined>(undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
