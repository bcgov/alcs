import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FileTypeDataSourceService } from '../../../services/search/file-type/file-type-data-source.service';

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService, ICurrentUser } from '../../../services/authentication/authentication.service';
import { FileTypeFilterDropDownComponent } from './file-type-filter-drop-down.component';

describe('FileTypeFilterDropDownComponent', () => {
  let component: FileTypeFilterDropDownComponent;
  let fixture: ComponentFixture<FileTypeFilterDropDownComponent>;
  let mockAuthenticationService: DeepMocked<AuthenticationService>;
  let currentUser: BehaviorSubject<ICurrentUser | undefined>;

  beforeEach(async () => {
    mockAuthenticationService = createMock();
    currentUser = new BehaviorSubject<ICurrentUser | undefined>(undefined);
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
      ],
      declarations: [FileTypeFilterDropDownComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [MatAutocompleteModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FileTypeFilterDropDownComponent);
    component = fixture.componentInstance;
    component.label = 'Label';
    component.fileTypeData = new FileTypeDataSourceService(mockAuthenticationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
