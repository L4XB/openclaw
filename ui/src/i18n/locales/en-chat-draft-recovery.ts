import type { TranslationMap } from "../lib/types.ts";
import { en } from "./en.ts";

const enChatDraftRecovery = {
  chat: {
    privateDraftReload: {
      blocked: en.chat.privateDraftReload.blocked,
      review: en.chat.privateDraftReload.review,
      title: "Unsent Incognito draft",
      description:
        "This draft stays only in this tab. Copy its text or download its attachments before discarding it to refresh. Keeping this tab open leaves the draft unchanged.",
      text: "Draft text",
      copy: "Copy text",
      goal: "This draft includes an unsent goal change.",
      reading:
        "Some attachments are still being read. Keep this tab open, then review the draft again when they finish.",
      changed: en.chat.privateDraftReload.changed,
      copyFailed:
        "The text could not be copied. Select it in the draft field and copy it manually.",
      attachmentUnavailable:
        "This attachment is no longer available to download. Keep the draft open and recover the original file before discarding it.",
      download: "Download {name}",
      discard: "Discard this draft and refresh",
      keep: "Keep in this tab",
      unavailable: en.chat.privateDraftReload.unavailable,
    },
  },
} satisfies TranslationMap;

export const registerChatDraftRecoveryEnglish = Object.assign(
  () => {
    Object.assign(en.chat.privateDraftReload, enChatDraftRecovery.chat.privateDraftReload);
  },
  { catalog: enChatDraftRecovery },
);
