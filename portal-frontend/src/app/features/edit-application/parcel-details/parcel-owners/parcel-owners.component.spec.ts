import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationOwnerService } from '../../../../services/application-owner/application-owner.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

import { ParcelOwnersComponent } from './parcel-owners.component';

describe('ParcelOwnersComponent', () => {
  let component: ParcelOwnersComponent;
  let fixture: ComponentFixture<ParcelOwnersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: MatDialog,
          useValue: {},
        },
        {
          provide: ApplicationOwnerService,
          useValue: {},
        },
        {
          provide: ConfirmationDialogService,
          useValue: {},
        },
      ],
      declarations: [ParcelOwnersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelOwnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
