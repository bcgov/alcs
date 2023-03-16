import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { ApplicationSubmissionService } from '../../services/application-submission/application-submission.service';
import { CodeService } from '../../services/code/code.service';
import { CreateApplicationDialogComponent } from './create-application-dialog.component';

describe('CreateApplicationDialogComponent', () => {
  let component: CreateApplicationDialogComponent;
  let fixture: ComponentFixture<CreateApplicationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, MatRadioModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: ApplicationSubmissionService,
          useValue: {},
        },
        {
          provide: CodeService,
          useValue: {},
        },
      ],
      declarations: [CreateApplicationDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateApplicationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
