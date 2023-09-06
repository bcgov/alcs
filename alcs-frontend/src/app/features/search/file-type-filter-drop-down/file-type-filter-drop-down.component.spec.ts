import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { FileTypeFilterDropDownComponent } from './file-type-filter-drop-down.component';

describe('FileTypeFilterDropDownComponent', () => {
  let component: FileTypeFilterDropDownComponent;
  let fixture: ComponentFixture<FileTypeFilterDropDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileTypeFilterDropDownComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [MatAutocompleteModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FileTypeFilterDropDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
