import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NoiDocumentService } from '../../../../../services/notice-of-intent/noi-document/noi-document.service';

import { RosoDetailsComponent } from './roso-details.component';

describe('RosoDetailsComponent', () => {
  let component: RosoDetailsComponent;
  let fixture: ComponentFixture<RosoDetailsComponent>;
  let mockNoiDocumentService: DeepMocked<NoiDocumentService>;

  beforeEach(async () => {
    mockNoiDocumentService = createMock();

    await TestBed.configureTestingModule({
      declarations: [RosoDetailsComponent],
      providers: [
        {
          provide: NoiDocumentService,
          useValue: mockNoiDocumentService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RosoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
