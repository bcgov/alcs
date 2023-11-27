import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';

import { ParcelOwnersComponent } from './parcel-owners.component';

describe('ParcelOwnersComponent', () => {
  let component: ParcelOwnersComponent;
  let fixture: ComponentFixture<ParcelOwnersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
      providers: [
        { provide: MatDialog, useValue: {} },
        { provide: ApplicationOwnerService, useValue: {} },
        { provide: ConfirmationDialogService, useValue: {} },
      ],
      declarations: [ParcelOwnersComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelOwnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
