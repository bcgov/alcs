import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';

import { ParcelOwnersComponent } from './parcel-owners.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ParcelOwnersComponent', () => {
  let component: ParcelOwnersComponent;
  let fixture: ComponentFixture<ParcelOwnersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ParcelOwnersComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [MatSnackBarModule],
    providers: [
        { provide: MatDialog, useValue: {} },
        { provide: ApplicationOwnerService, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ParcelOwnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
