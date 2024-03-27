import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { InquirySearchTableComponent } from './inquiry-search-table.component';

describe('InquirySearchTableComponent', () => {
  let component: InquirySearchTableComponent;
  let fixture: ComponentFixture<InquirySearchTableComponent>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(() => {
    mockRouter = createMock();

    TestBed.configureTestingModule({
      declarations: [InquirySearchTableComponent],
      providers: [
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(InquirySearchTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
