import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';

import { NfuDetailsComponent } from './nfu-details.component';

describe('NfuDetailsComponent', () => {
  let component: NfuDetailsComponent;
  let fixture: ComponentFixture<NfuDetailsComponent>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockAppDocumentService = createMock();

    await TestBed.configureTestingModule({
      declarations: [NfuDetailsComponent],
      providers: [
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
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
