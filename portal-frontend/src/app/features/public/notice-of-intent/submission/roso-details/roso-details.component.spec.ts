import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PublicService } from '../../../../../services/public/public.service';

import { RosoDetailsComponent } from './roso-details.component';
import { DocumentService } from '../../../../../services/document/document.service';

describe('RosoDetailsComponent', () => {
  let component: RosoDetailsComponent;
  let fixture: ComponentFixture<RosoDetailsComponent>;
  let mockPublicService: DeepMocked<PublicService>;
  let mockDocumentService: DeepMocked<DocumentService>;

  beforeEach(async () => {
    mockPublicService = createMock();
    mockDocumentService = createMock();

    await TestBed.configureTestingModule({
      declarations: [RosoDetailsComponent],
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

    fixture = TestBed.createComponent(RosoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
