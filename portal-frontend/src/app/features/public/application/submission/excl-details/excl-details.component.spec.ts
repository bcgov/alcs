import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PublicService } from '../../../../../services/public/public.service';
import { ExclDetailsComponent } from './excl-details.component';
import { DocumentService } from '../../../../../services/document/document.service';

describe('ExclDetailsComponent', () => {
  let component: ExclDetailsComponent;
  let fixture: ComponentFixture<ExclDetailsComponent>;
  let mockPublicService: DeepMocked<PublicService>;
  let mockDocumentService: DeepMocked<DocumentService>;

  beforeEach(async () => {
    mockPublicService = createMock();
    mockDocumentService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ExclDetailsComponent],
      providers: [
        {
          provide: PublicService,
          useValue: mockPublicService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExclDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
