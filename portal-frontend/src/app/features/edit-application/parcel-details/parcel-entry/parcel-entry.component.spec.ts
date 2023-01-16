import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ParcelService } from '../../../../services/parcel/parcel.service';

import { ParcelEntryComponent } from './parcel-entry.component';

describe('ParcelEntryComponent', () => {
  let component: ParcelEntryComponent;
  let fixture: ComponentFixture<ParcelEntryComponent>;
  let mockParcelService: DeepMocked<ParcelService>;

  beforeEach(async () => {
    mockParcelService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ParcelEntryComponent],
      providers: [
        {
          provide: ParcelService,
          useValue: mockParcelService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
