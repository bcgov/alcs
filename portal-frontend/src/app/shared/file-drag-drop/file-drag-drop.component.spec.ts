import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDragDropComponent } from './file-drag-drop.component';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HttpClient } from '@angular/common/http';
import { DocumentService } from '../../services/document/document.service';

describe('FileDragDropComponent', () => {
  let component: FileDragDropComponent;
  let fixture: ComponentFixture<FileDragDropComponent>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockDocumentService: DeepMocked<DocumentService>;

  beforeEach(async () => {
    mockHttpClient = createMock();
    mockDocumentService = createMock();

    await TestBed.configureTestingModule({
      declarations: [FileDragDropComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FileDragDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
