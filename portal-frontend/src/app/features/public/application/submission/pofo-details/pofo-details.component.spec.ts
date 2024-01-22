import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';
import { PublicService } from '../../../../../services/public/public.service';

import { PofoDetailsComponent } from './pofo-details.component';

describe('PofoDetailsComponent', () => {
  let component: PofoDetailsComponent;
  let fixture: ComponentFixture<PofoDetailsComponent>;
  let mockPublicService: DeepMocked<PublicService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PofoDetailsComponent],
      providers: [
        {
          provide: PublicService,
          useValue: mockPublicService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PofoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
