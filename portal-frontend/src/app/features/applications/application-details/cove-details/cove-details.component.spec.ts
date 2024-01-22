import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';
import { CovenantTransfereeService } from '../../../../services/covenant-transferee/covenant-transferee.service';

import { CoveDetailsComponent } from './cove-details.component';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';

describe('CoveDetailsComponent', () => {
  let component: CoveDetailsComponent;
  let fixture: ComponentFixture<CoveDetailsComponent>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockAppParcelService: DeepMocked<ApplicationParcelService>;
  let mockTransfereeService: DeepMocked<CovenantTransfereeService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoveDetailsComponent],
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
          provide: CovenantTransfereeService,
          useValue: mockTransfereeService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CoveDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
