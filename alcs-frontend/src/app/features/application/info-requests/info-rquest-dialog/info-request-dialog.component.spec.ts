import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationMeetingService } from '../../../../services/application/application-meeting/application-meeting.service';

import { InfoRequestDialogComponent } from './info-request-dialog.component';

describe('InfoRequestDialogComponent', () => {
  let component: InfoRequestDialogComponent;
  let fixture: ComponentFixture<InfoRequestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {},
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
        {
          provide: ApplicationMeetingService,
          useValue: {},
        },
      ],
      declarations: [InfoRequestDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
