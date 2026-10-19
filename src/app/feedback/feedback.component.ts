import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";
import { FeedbackService } from '../feedback.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-feedback',
    templateUrl: './feedback.component.html',
    styleUrls: ['./feedback.component.css'],
    standalone: false
})
export class FeedbackComponent implements OnInit {

  public feedbackEmail = "";
  public feedbackText = "";
  public feedbackSentMessage: string | null = "";

  constructor(private route: ActivatedRoute, private feedbackService: FeedbackService) { }

  ngOnInit(): void {
  }

  public sendFeedback() {
    this.route.params
      .pipe(filter((params) => params.itemId))
      .subscribe((params: Params) => {
        this.feedbackService
          .sendFeedback(params.itemId, this.feedbackEmail, this.feedbackText)
          .subscribe((response: { status: number; data: { msg: string } }) => {
            this.feedbackSentMessage = response.data.msg;
            this.feedbackEmail = '';
            this.feedbackText = '';
          });
      });
  }
}
