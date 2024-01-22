import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PublicService } from '../../../../../services/public/public.service';
import { ParcelComponent } from './parcel.component';

describe('ParcelComponent', () => {
  let component: ParcelComponent;
  let fixture: ComponentFixture<ParcelComponent>;

  let mockPublicService: DeepMocked<PublicService>;

  beforeEach(async () => {
    mockPublicService = createMock();
    await TestBed.configureTestingModule({
      declarations: [ParcelComponent],
      providers: [
        {
          provide: PublicService,
          useValue: mockPublicService,
        },
        {
          provides: Router,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelComponent);
    component = fixture.componentInstance;
    component.submission = {} as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
