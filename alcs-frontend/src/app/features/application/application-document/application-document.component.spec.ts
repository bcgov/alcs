import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationDocumentService } from '../../../services/application/application-document/application-document.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { ApplicationDocumentComponent } from './application-document.component';

describe('DecisionDocumentComponent', () => {
  let component: ApplicationDocumentComponent;
  let fixture: ComponentFixture<ApplicationDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationDocumentService,
          useValue: {},
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
      ],
      declarations: [ApplicationDocumentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
