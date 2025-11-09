import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  public transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return '';
    }

    try {
      const html = marked.parse(value, {
        async: false,
        breaks: true,
        gfm: true
      }) as string;

      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return this.sanitizer.bypassSecurityTrustHtml(value);
    }
  }
}
