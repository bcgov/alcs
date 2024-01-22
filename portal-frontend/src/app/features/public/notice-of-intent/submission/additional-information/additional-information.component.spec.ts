import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';
import { PublicService } from '../../../../../services/public/public.service';

import { AdditionalInformationComponent } from './additional-information.component';

describe('AdditionalInformationComponent', () => {
  let component: AdditionalInformationComponent;
  let fixture: ComponentFixture<AdditionalInformationComponent>;
  let mockPublicService: DeepMocked<PublicService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdditionalInformationComponent],
      providers: [
        {
          provide: PublicService,
          useValue: mockPublicService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdditionalInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
