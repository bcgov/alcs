import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';

import { NaruDetailsComponent } from './naru-details.component';
import { DocumentService } from '../../../../services/document/document.service';

describe('NaruDetailsComponent', () => {
  let component: NaruDetailsComponent;
  let fixture: ComponentFixture<NaruDetailsComponent>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockDocumentService: DeepMocked<DocumentService>;

  beforeEach(async () => {
    mockAppDocumentService = createMock();
    mockDocumentService = createMock();

    await TestBed.configureTestingModule({
      declarations: [NaruDetailsComponent],
      providers: [
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NaruDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
