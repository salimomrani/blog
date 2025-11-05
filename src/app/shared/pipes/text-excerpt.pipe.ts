import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to extract plain text from HTML and create an excerpt
 * Usage: {{ htmlContent | textExcerpt:200 }}
 */
@Pipe({
  name: 'textExcerpt',
  standalone: true,
  pure: true
})
export class TextExcerptPipe implements PipeTransform {
  /**
   * Transform HTML content to plain text excerpt
   * @param value HTML string
   * @param maxLength Maximum length of excerpt (default: 150)
   * @returns Plain text excerpt with ellipsis if truncated
   */
  public transform(value: string, maxLength: number = 150): string {
    if (!value) {
      return '';
    }

    // Remove HTML tags
    const text = value.replace(/<[^>]*>/g, '');

    // Decode HTML entities (&nbsp; etc.)
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    const decodedText = textarea.value;

    // Trim whitespace
    const trimmed = decodedText.trim();

    // Truncate if needed
    if (trimmed.length <= maxLength) {
      return trimmed;
    }

    // Find last space before maxLength
    const truncated = trimmed.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
  }
}
