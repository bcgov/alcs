import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule, Routes } from '@angular/router';
import { MentionModule } from 'angular-mentions';
import { CardComponent } from '../../shared/card/card.component';
import { CommentComponent } from '../../shared/commenting/comment.component';
import { CommentsComponent } from '../../shared/commenting/comments.component';
import { DragDropBoardComponent } from '../../shared/drag-drop-board/drag-drop-board.component';
import { StatusFilterPipe } from '../../shared/drag-drop-board/status-filter.pipe';
import { MentionTextareaComponent } from '../../shared/mention-textarea/mention-textarea.component';
import { SharedModule } from '../../shared/shared.module';
import { BoardComponent } from './board.component';
import { CardDetailDialogComponent } from './card-detail-dialog/card-detail-dialog.component';
import { CreateCardDialogComponent } from './create-card-detail-dialog/create-card-dialog.component';
import { SubtasksComponent } from './subtasks/subtasks.component';

const routes: Routes = [
  {
    path: ':boardCode',
    component: BoardComponent,
  },
];

@NgModule({
  declarations: [
    BoardComponent,
    DragDropBoardComponent,
    StatusFilterPipe,
    CardDetailDialogComponent,
    CreateCardDialogComponent,
    CardComponent,
    CommentComponent,
    CommentsComponent,
    MentionTextareaComponent,
    SubtasksComponent,
  ],
  imports: [
    CommonModule,
    SharedModule.forRoot(),
    DragDropModule,
    MatGridListModule,
    RouterModule.forChild(routes),
    MentionModule,
  ],
})
export class BoardModule {}
