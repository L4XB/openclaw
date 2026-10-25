import { type ContentBlock, ConversationRole, type Message } from "@aws-sdk/client-bedrock-runtime";

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
