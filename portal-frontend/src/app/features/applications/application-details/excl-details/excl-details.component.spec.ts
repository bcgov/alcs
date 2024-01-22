import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';

import { ExclDetailsComponent } from './excl-details.component';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';

describe('ExclDetailsComponent', () => {
  let component: ExclDetailsComponent;
  let fixture: ComponentFixture<ExclDetailsComponent>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;
  let mockAppParcelService: DeepMocked<ApplicationParcelService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExclDetailsComponent],
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

    fixture = TestBed.createComponent(ExclDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
