import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';
import { PublicService } from '../../../../../services/public/public.service';
import { ExclDetailsComponent } from './excl-details.component';

describe('ExclDetailsComponent', () => {
  let component: ExclDetailsComponent;
  let fixture: ComponentFixture<ExclDetailsComponent>;
  let mockPublicService: DeepMocked<PublicService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExclDetailsComponent],
      providers: [
        {
          provide: PublicService,
          useValue: mockPublicService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExclDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
