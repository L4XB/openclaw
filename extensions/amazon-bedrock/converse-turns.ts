import {
  type CachePointBlock,
  type ContentBlock,
  ConversationRole,
  type Message,
} from "@aws-sdk/client-bedrock-runtime";

/** Where the first transient runtime context starts: its message and the block within it. */
export type VolatileStart = { message: number; block: number };

/**
 * Returns the content array that the next user turn's blocks go into.
 *
 * Converse requires alternating roles. The runner merges consecutive user turns, but not a user
 * turn that follows tool results (a steering message, or a prompt after a turn that stopped during
 * tools), so that turn joins the tool-result message after its tool results. Otherwise a new user
 * message is appended.
 */
export function userTurnContent(messages: Message[]): ContentBlock[] {
  const previous = messages.at(-1);
  if (
    previous?.role === ConversationRole.USER &&
    previous.content?.some((block) => block.toolResult)
  ) {
    return previous.content;
  }
  const content: ContentBlock[] = [];
  messages.push({ role: ConversationRole.USER, content });
  return content;
}

/**
 * Adds up to two message cache points in front of the first transient runtime context. Cache
 * points include their entire prefix, so none may follow that context. When the context came with
 * a user turn that joined tool results, the first one goes between the tool results and the turn,
 * so the tool results stay cached as they were in their own message.
 */
export function addMessageCachePoints(
  messages: Message[],
  cachePoint: CachePointBlock,
  volatileStart: VolatileStart | undefined,
): void {
  // Keep the prior checkpoint reachable when a new turn exceeds AWS's 20-block lookback.
  let remaining = 2;
  if (volatileStart && volatileStart.block > 0) {
    messages[volatileStart.message]?.content?.splice(volatileStart.block, 0, { cachePoint });
    remaining--;
  }
  for (let index = (volatileStart?.message ?? messages.length) - 1; index >= 0; index--) {
    const message = messages[index];
    if (message?.role === ConversationRole.USER && message.content) {
      message.content.push({ cachePoint });
      if (--remaining === 0) {
        break;
      }
    }
  }
}
