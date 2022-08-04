import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule, Routes } from '@angular/router';
import { AppModule } from '../../app.module';
import { CardComponent } from '../../shared/card/card.component';
import { CommentComponent } from '../../shared/commenting/comment.component';
import { CommentsComponent } from '../../shared/commenting/comments.component';
import { DragDropBoardComponent } from '../../shared/drag-drop-board/drag-drop-board.component';
import { StatusFilterPipe } from '../../shared/drag-drop-board/status-filter.pipe';
import { InlineEditComponent } from '../../shared/inline-edit/inline-edit.component';
import { SharedModule } from '../../shared/shared.module';
import { CardDetailDialogComponent } from '../card-detail-dialog/card-detail-dialog.component';
import { CreateCardDialogComponent } from '../create-card-detail-dialog/create-card-dialog.component';
import { BoardComponent } from './board.component';

const routes: Routes = [
  {
    path: '',
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
    InlineEditComponent,
    CommentComponent,
    CommentsComponent,
  ],
  imports: [CommonModule, SharedModule, DragDropModule, MatGridListModule, RouterModule.forChild(routes)],
  providers: [],
})
export class BoardModule {}
