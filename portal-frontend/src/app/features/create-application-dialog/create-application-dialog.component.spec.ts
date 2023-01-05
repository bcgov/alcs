import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ApplicationService } from '../../services/application/application.service';
import { CodeService } from '../../services/code/code.service';

import { CreateApplicationDialogComponent } from './create-application-dialog.component';
import { SharedModule } from '../../shared/shared.module';

describe('CreateApplicationDialogComponent', () => {
  let component: CreateApplicationDialogComponent;
  let fixture: ComponentFixture<CreateApplicationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, SharedModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: ApplicationService,
          useValue: {},
        },
        {
          provide: CodeService,
          useValue: {},
        },
      ],
      declarations: [CreateApplicationDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateApplicationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
