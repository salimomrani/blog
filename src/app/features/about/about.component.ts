import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent {
  linkedinUrl = 'https://www.linkedin.com/in/salim-omrani/';
  collectiveWorkUrl = 'https://app.collective.work/collective/salim-omrani/profile?tab=1';
}
