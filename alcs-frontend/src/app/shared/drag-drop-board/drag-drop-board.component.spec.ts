import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragDropBoardComponent } from './drag-drop-board.component';
import { DragDropItem } from './drag-drop-item.interface';
import { StatusFilterPipe } from './status-filter.pipe';

describe('DragDropBoardComponent', () => {
  let component: DragDropBoardComponent;
  let fixture: ComponentFixture<DragDropBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DragDropBoardComponent, StatusFilterPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(DragDropBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render a card with the correct label', () => {
    const testCard: DragDropItem = {
      id: '1',
      status: 'status',
      label: 'label',
      assignee: '',
    };

    component.columns = [
      {
        status: 'status',
        name: 'Status',
        allowedTransitions: [],
      },
    ];
    component.cards = [testCard];
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#card-1').textContent).toContain(testCard.label);
  });
});
