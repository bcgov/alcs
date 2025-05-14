import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';

import { SubdDetailsComponent } from './subd-details.component';
import { HttpClient } from '@angular/common/http';
import { DocumentService } from '../../../../services/document/document.service';

describe('SubdDetailsComponent', () => {
  let component: SubdDetailsComponent;
  let fixture: ComponentFixture<SubdDetailsComponent>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockAppParcelService: DeepMocked<ApplicationParcelService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockDocumentService: DeepMocked<DocumentService>;

  beforeEach(async () => {
    mockAppDocumentService = createMock();
    mockAppParcelService = createMock();
    mockHttpClient = createMock();
    mockDocumentService = createMock();

    await TestBed.configureTestingModule({
      declarations: [SubdDetailsComponent],
      providers: [
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockAppParcelService,
        },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubdDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
