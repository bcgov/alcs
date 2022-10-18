import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationReconsiderationService } from '../../../../services/application/application-reconsideration/application-reconsideration.service';
import { ToastService } from '../../../../services/toast/toast.service';

import { PostDecisionDialogComponent } from './post-decision-dialog.component';

describe('PostDecisionDialogComponent', () => {
  let component: PostDecisionDialogComponent;
  let fixture: ComponentFixture<PostDecisionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostDecisionDialogComponent],
      providers: [
        {
          provide: ApplicationReconsiderationService,
          useValue: {},
        },
        {
          provide: ToastService,
          useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: { existingDecision: { type: {} } } },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostDecisionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
