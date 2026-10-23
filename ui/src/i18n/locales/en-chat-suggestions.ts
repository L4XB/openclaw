import type { TranslationMap } from "../lib/types.ts";
import { en } from "./en.ts";

const enChatSuggestions = {
  chat: {
    sessionSuggestions: {
      suggest: en.chat.sessionSuggestions.suggest,
      suggestMessage: en.chat.sessionSuggestions.suggestMessage,
      attachmentsUnsupported: en.chat.sessionSuggestions.attachmentsUnsupported,
      sendNow: "Send {author}'s suggestion now",
      queue: "Queue {author}'s suggestion",
      edit: "Edit {author}'s suggestion",
      dismiss: "Dismiss {author}'s suggestion",
      typing: en.chat.sessionSuggestions.typing,
      typingMany: en.chat.sessionSuggestions.typingMany,
      typingSeveral: en.chat.sessionSuggestions.typingSeveral,
      typingOthers: en.chat.sessionSuggestions.typingOthers,
      otherCollaborators: en.chat.sessionSuggestions.otherCollaborators,
      typingDraftState: en.chat.sessionSuggestions.typingDraftState,
      pausedDraftState: en.chat.sessionSuggestions.pausedDraftState,
      state: {
        pending: "Pending",
        accepted: "Accepted",
        dismissed: "Dismissed",
      },
    },
  },
} satisfies TranslationMap;

export const registerChatSuggestionsEnglish = Object.assign(
  () => {
    const { state, ...labels } = enChatSuggestions.chat.sessionSuggestions;
    Object.assign(en.chat.sessionSuggestions, labels);
    Object.assign(en.chat.sessionSuggestions.state, state);
  },
  { catalog: enChatSuggestions },
);
