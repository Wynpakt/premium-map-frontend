import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FeedbackComponent } from './feedback.component';

const routes: Routes = [
  {
    path: 'neu',
    component: FeedbackComponent,
    data: { report: true }
  },
  {
    path: ':itemId',
    component: FeedbackComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeedbackRoutingModule { }
