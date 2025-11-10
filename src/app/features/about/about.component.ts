import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingService } from '../../services/tracking.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent implements OnInit {
  private readonly trackingService = inject(TrackingService);

  linkedinUrl = 'https://www.linkedin.com/in/salim-omrani/';
  collectiveWorkUrl = 'https://app.collective.work/collective/salim-omrani/profile?tab=1';

  public ngOnInit(): void {
    this.trackingService.trackEvent({ type: 'pageView', page: 'about' }).subscribe();
  }

  public onLinkClick(link: string): void {
    this.trackingService.trackEvent({ type: 'linkClick', link }).subscribe();
  }
}
