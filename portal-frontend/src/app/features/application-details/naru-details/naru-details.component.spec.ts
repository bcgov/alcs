import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';

import { NaruDetailsComponent } from './naru-details.component';

describe('PofoDetailsComponent', () => {
  let component: NaruDetailsComponent;
  let fixture: ComponentFixture<NaruDetailsComponent>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockAppParcelService: DeepMocked<ApplicationParcelService>;

  beforeEach(async () => {
    mockAppParcelService = createMock();
    mockAppDocumentService = createMock();

    await TestBed.configureTestingModule({
      declarations: [NaruDetailsComponent],
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

    fixture = TestBed.createComponent(NaruDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
