import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';

import { PofoDetailsComponent } from './pofo-details.component';

describe('PofoDetailsComponent', () => {
  let component: PofoDetailsComponent;
  let fixture: ComponentFixture<PofoDetailsComponent>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockAppParcelService: DeepMocked<ApplicationParcelService>;

  beforeEach(async () => {
    mockAppParcelService = createMock();
    mockAppDocumentService = createMock();

    await TestBed.configureTestingModule({
      declarations: [PofoDetailsComponent],
      providers: [
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockAppParcelService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PofoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
