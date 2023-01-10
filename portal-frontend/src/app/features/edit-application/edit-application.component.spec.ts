import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterTestingModule } from '@angular/router/testing';
import { ApplicationService } from '../../services/application/application.service';
import { CodeService } from '../../services/code/code.service';

import { MatDialogModule } from '@angular/material/dialog';
import { EditApplicationComponent } from './edit-application.component';

describe('EditApplicationComponent', () => {
  let component: EditApplicationComponent;
  let fixture: ComponentFixture<EditApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditApplicationComponent],
      providers: [
        {
          provide: ApplicationService,
          useValue: {},
        },
        {
          provide: CodeService,
          useValue: {},
        },
      ],
      imports: [RouterTestingModule, MatAutocompleteModule, MatDialogModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EditApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
