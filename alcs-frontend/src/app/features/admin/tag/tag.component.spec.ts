import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PaginatedTagResponse, TagService } from '../../../services/tag/tag.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { TagComponent } from './tag.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BehaviorSubject } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('TagComponent', () => {
  let component: TagComponent;
  let fixture: ComponentFixture<TagComponent>;
  let mockTagService: DeepMocked<TagService>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockConfirmationDialogService: DeepMocked<ConfirmationDialogService>;

  beforeEach(async () => {
    mockTagService = createMock();
    mockDialog = createMock();
    mockConfirmationDialogService = createMock();
    mockTagService.$tags = new BehaviorSubject<PaginatedTagResponse>({ data: [], total: 0 });

    await TestBed.configureTestingModule({
    declarations: [TagComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [MatAutocompleteModule],
    providers: [
        {
            provide: TagService,
            useValue: mockTagService,
        },
        {
            provide: MatDialog,
            useValue: mockDialog,
        },
        {
            provide: ConfirmationDialogService,
            useValue: mockConfirmationDialogService,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(TagComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
