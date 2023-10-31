import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';
import { PublicService } from '../../../../../services/public/public.service';

import { CoveDetailsComponent } from './cove-details.component';

describe('CoveDetailsComponent', () => {
  let component: CoveDetailsComponent;
  let fixture: ComponentFixture<CoveDetailsComponent>;
  let mockPublicService: DeepMocked<PublicService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoveDetailsComponent],
      providers: [
        {
          provide: PublicService,
          useValue: mockPublicService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CoveDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
