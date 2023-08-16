import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';
import { NoiDocumentService } from '../../../../../../services/notice-of-intent/noi-document/noi-document.service';
import { RosoAdditionalInformationComponent } from './roso-additional-information.component';

describe('RosoAdditionalInformationComponent', () => {
  let component: RosoAdditionalInformationComponent;
  let fixture: ComponentFixture<RosoAdditionalInformationComponent>;
  let mockNoiDocumentService: DeepMocked<NoiDocumentService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RosoAdditionalInformationComponent],
      providers: [
        {
          provide: NoiDocumentService,
          useValue: mockNoiDocumentService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RosoAdditionalInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
