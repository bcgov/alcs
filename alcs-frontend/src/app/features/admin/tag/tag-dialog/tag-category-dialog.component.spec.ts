import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminLocalGovernmentService } from '../../../../services/admin-local-government/admin-local-government.service';

import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { PaginatedTagResponse, TagService } from '../../../../services/tag/tag.service';
import { TagDialogComponent } from './tag-dialog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TagDialogComponent', () => {
  let component: TagDialogComponent;
  let fixture: ComponentFixture<TagDialogComponent>;
  let mockTagService: DeepMocked<TagService>;

  beforeEach(async () => {
    mockTagService = createMock();
    mockTagService.$tags = new BehaviorSubject<PaginatedTagResponse>({ data: [], total: 0 });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      declarations: [TagDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: undefined },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: AdminLocalGovernmentService,
          useValue: {},
        },
        {
          provide: TagService,
          useValue: mockTagService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TagDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
