import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationDocumentService } from '../../../../services/application/application-document/application-document.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

import { DecisionDocumentComponent } from './decision-document.component';

describe('DecisionDocumentComponent', () => {
  let component: DecisionDocumentComponent;
  let fixture: ComponentFixture<DecisionDocumentComponent>;

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
      declarations: [DecisionDocumentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
