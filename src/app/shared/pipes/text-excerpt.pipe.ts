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
   * Transform HTML/Markdown content to plain text excerpt
   * @param value HTML or Markdown string
   * @param maxLength Maximum length of excerpt (default: 150)
   * @returns Plain text excerpt with ellipsis if truncated
   */
  public transform(value: string, maxLength = 150): string {
    if (!value) {
      return '';
    }

    // Remove markdown syntax
    let text = value
      // Remove headers (## Title -> Title)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold/italic (**text** or __text__ or *text* or _text_)
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Remove links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images ![alt](url) -> alt
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // Remove code blocks ```code``` -> code
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code `code` -> code
      .replace(/`([^`]+)`/g, '$1')
      // Remove blockquotes > text -> text
      .replace(/^>\s+/gm, '')
      // Remove horizontal rules
      .replace(/^[-*_]{3,}$/gm, '')
      // Remove list markers (- item, * item, 1. item)
      .replace(/^[\s]*[-*+]\s+/gm, '')
      .replace(/^[\s]*\d+\.\s+/gm, '');

    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, '');

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
