import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'email' | 'copy';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './share.component.html',
  styleUrl: './share.component.scss'
})
export class ShareComponent {
  public readonly title = input('');
  public readonly url = input('');
  public readonly description = input('');
  public readonly showLabels = input(false);
  public readonly size = input<'small' | 'medium' | 'large'>('medium');
  public readonly shared = output<SharePlatform>();

  private copySuccessTimeout?: ReturnType<typeof setTimeout>;
  protected copySuccess = false;

  public shareOnTwitter(): void {
    const text = encodeURIComponent(`${this.title()}\n${this.description()}`);
    const url = encodeURIComponent(this.url());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    this.shared.emit('twitter');
  }

  public shareOnFacebook(): void {
    const url = encodeURIComponent(this.url());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    this.shared.emit('facebook');
  }

  public shareOnLinkedIn(): void {
    const url = encodeURIComponent(this.url());
    const title = encodeURIComponent(this.title());
    const summary = encodeURIComponent(this.description());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
    this.shared.emit('linkedin');
  }

  public shareViaEmail(): void {
    const subject = encodeURIComponent(this.title());
    const body = encodeURIComponent(`${this.description()}\n\n${this.url()}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    this.shared.emit('email');
  }

  public copyLink(): Promise<void> {
    return navigator.clipboard.writeText(this.url()).then(() => {
      this.copySuccess = true;
      this.shared.emit('copy');

      if (this.copySuccessTimeout) {
        clearTimeout(this.copySuccessTimeout);
      }

      this.copySuccessTimeout = setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    }).catch((error: Error) => {
      console.error('Failed to copy link:', error);
    });
  }
}
