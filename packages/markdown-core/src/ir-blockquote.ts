import type { MarkdownStyleSpan } from "./ir-spans.js";

/**
 * End of a closing blockquote: its content without the trailing paragraph separator, but never
 * before a table placeholder or the end of a code block that started inside the quote.
 */
export function resolveBlockquoteEnd(
  state: {
    text: string;
    styles: readonly MarkdownStyleSpan[];
    collectedTables: readonly { placeholderOffset: number }[];
  },
  start: number,
): number {
  let end = Math.max(
    start,
    state.text.endsWith("\n\n") ? state.text.length - 2 : state.text.length,
    (state.collectedTables.at(-1)?.placeholderOffset ?? -1) + 1,
  );
  // A code block that ends the quote keeps its own final newline inside the quote.
  for (const span of state.styles) {
    if (span.style === "code_block" && span.start >= start) {
      end = Math.max(end, span.end);
    }
  }
  return end;
}
