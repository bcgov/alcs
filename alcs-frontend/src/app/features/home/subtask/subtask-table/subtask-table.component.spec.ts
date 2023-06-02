import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CardSubtaskService } from '../../../../services/card/card-subtask/card-subtask.service';

import { SubtaskTableComponent } from './subtask-table.component';

describe('SubtaskTableComponent', () => {
  let component: SubtaskTableComponent;
  let fixture: ComponentFixture<SubtaskTableComponent>;
  let mockCardSubtaskService: DeepMocked<CardSubtaskService>;

  beforeEach(async () => {
    mockCardSubtaskService = createMock();

    await TestBed.configureTestingModule({
      declarations: [SubtaskTableComponent],
      providers: [
        {
          provide: CardSubtaskService,
          useValue: mockCardSubtaskService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SubtaskTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
