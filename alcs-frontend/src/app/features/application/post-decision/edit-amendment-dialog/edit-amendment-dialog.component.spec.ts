import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationAmendmentService } from '../../../../services/application/application-amendment/application-amendment.service';
import { ApplicationReconsiderationService } from '../../../../services/application/application-reconsideration/application-reconsideration.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { EditAmendmentDialogComponent } from './edit-amendment-dialog.component';

describe('EditAmendmentDialogComponent', () => {
  let component: EditAmendmentDialogComponent;
  let fixture: ComponentFixture<EditAmendmentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditAmendmentDialogComponent],
      providers: [
        {
          provide: ApplicationAmendmentService,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: { existingAmendment: { submittedDate: 121231 } } },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAmendmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
