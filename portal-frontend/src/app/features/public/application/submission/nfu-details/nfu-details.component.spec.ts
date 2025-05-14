import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PublicService } from '../../../../../services/public/public.service';

import { NfuDetailsComponent } from './nfu-details.component';
import { HttpClient } from '@angular/common/http';
import { DocumentService } from '../../../../../services/document/document.service';

describe('NfuDetailsComponent', () => {
  let component: NfuDetailsComponent;
  let fixture: ComponentFixture<NfuDetailsComponent>;
  let mockPublicService: DeepMocked<PublicService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockDocumentService: DeepMocked<DocumentService>;

  beforeEach(async () => {
    mockPublicService = createMock();
    mockHttpClient = createMock();
    mockDocumentService = createMock();

    await TestBed.configureTestingModule({
      declarations: [NfuDetailsComponent],
      providers: [
        {
          provide: PublicService,
          useValue: mockPublicService,
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

    fixture = TestBed.createComponent(NfuDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
