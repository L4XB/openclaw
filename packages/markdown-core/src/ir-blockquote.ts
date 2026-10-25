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

// Tokens that never start a quoted line's content: closers, breaks (the next token starts the
// line), list and table containers, and code blocks, which stay unprefixed.
const UNQUOTED_LINE_TOKENS = new Set([
  "softbreak",
  "hardbreak",
  "inline",
  "fence",
  "code_block",
  "bullet_list_open",
  "ordered_list_open",
  "table_open",
  "thead_open",
  "tbody_open",
  "tr_open",
  "th_open",
  "td_open",
]);

/**
 * Prefix-quoted text (Slack, Signal, WhatsApp) marks every line of a quote: an opening quote
 * writes its prefix, and the first token of each new line inside a quote writes the prefix once
 * per quote level.
 */
export function prefixQuotedLine(
  state: {
    text: string;
    blockquotePrefix: string;
    blockquoteStack: readonly unknown[];
    table: unknown;
  },
  tokenType: string,
): void {
  if (!state.blockquotePrefix || state.table) {
    return;
  }
  const depth = state.blockquoteStack.length;
  const atLineStart = state.text.endsWith("\n");
  if (tokenType === "blockquote_open") {
    // A nested quote that starts a new line repeats the outer levels before its own.
    state.text += state.blockquotePrefix.repeat(atLineStart ? depth + 1 : 1);
    return;
  }
  if (depth === 0 || !atLineStart || tokenType.endsWith("_close")) {
    return;
  }
  if (!UNQUOTED_LINE_TOKENS.has(tokenType)) {
    state.text += state.blockquotePrefix.repeat(depth);
  }
}
