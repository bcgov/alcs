import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../../../services/application/application-document/application-document.service';

import { SubdDetailsComponent } from './subd-details.component';

describe('SubdDetailsComponent', () => {
  let component: SubdDetailsComponent;
  let fixture: ComponentFixture<SubdDetailsComponent>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubdDetailsComponent],
      providers: [
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubdDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
