import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';
import { NoiDocumentService } from '../../../../../services/notice-of-intent/noi-document/noi-document.service';

import { PfrsDetailsComponent } from './pfrs-details.component';

describe('PfrsDetailsComponent', () => {
  let component: PfrsDetailsComponent;
  let fixture: ComponentFixture<PfrsDetailsComponent>;
  let mockNoiDocumentService: DeepMocked<NoiDocumentService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PfrsDetailsComponent],
      providers: [
        {
          provide: NoiDocumentService,
          useValue: mockNoiDocumentService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PfrsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
