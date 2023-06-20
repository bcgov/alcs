import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../../../services/application/application-document/application-document.service';

import { NaruDetailsComponent } from './naru-details.component';

describe('RosoDetailsComponent', () => {
  let component: NaruDetailsComponent;
  let fixture: ComponentFixture<NaruDetailsComponent>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NaruDetailsComponent],
      providers: [
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NaruDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
