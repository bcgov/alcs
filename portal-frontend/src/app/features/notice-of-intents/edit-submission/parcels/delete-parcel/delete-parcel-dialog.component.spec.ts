import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ApplicationParcelService } from '../../../../../services/application-parcel/application-parcel.service';
import { DeleteParcelDialogComponent } from './delete-parcel-dialog.component';

describe('DeleteParcelDialogComponent', () => {
  let component: DeleteParcelDialogComponent;
  let fixture: ComponentFixture<DeleteParcelDialogComponent>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockApplicationParcelService: DeepMocked<ApplicationParcelService>;

  beforeEach(async () => {
    mockHttpClient = createMock();
    mockApplicationParcelService = createMock();

    await TestBed.configureTestingModule({
      declarations: [DeleteParcelDialogComponent],
      providers: [
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockApplicationParcelService,
        },
        {
          provide: MatDialogRef,
          useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteParcelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
