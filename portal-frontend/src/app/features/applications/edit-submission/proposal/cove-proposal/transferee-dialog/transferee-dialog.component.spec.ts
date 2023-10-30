import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CovenantTransfereeService } from '../../../../../../services/covenant-transferee/covenant-transferee.service';
import { CovenantTransfereeDialogComponent } from './transferee-dialog.component';

describe('TransfereeDialogComponent', () => {
  let component: CovenantTransfereeDialogComponent;
  let fixture: ComponentFixture<CovenantTransfereeDialogComponent>;
  let mockTransfereeService: DeepMocked<CovenantTransfereeService>;

  beforeEach(async () => {
    mockTransfereeService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: CovenantTransfereeService,
          useValue: mockTransfereeService,
        },
        {
          provide: MatDialogRef,
          useValue: {},
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
      ],
      declarations: [CovenantTransfereeDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CovenantTransfereeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
