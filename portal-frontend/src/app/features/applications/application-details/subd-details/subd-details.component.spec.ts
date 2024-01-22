import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';

import { SubdDetailsComponent } from './subd-details.component';

describe('SubdDetailsComponent', () => {
  let component: SubdDetailsComponent;
  let fixture: ComponentFixture<SubdDetailsComponent>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockAppParcelService: DeepMocked<ApplicationParcelService>;

  beforeEach(async () => {
    mockAppParcelService = createMock();
    mockAppDocumentService = createMock();

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
