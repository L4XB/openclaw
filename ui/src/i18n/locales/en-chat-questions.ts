import type { TranslationMap } from "../lib/types.ts";
import { en } from "./en.ts";

const enChatQuestions = {
  chat: {
    questions: {
      showSecret: "Show secret",
      hideSecret: "Hide secret",
      resourcePreview: "Preview resource",
      addResources: en.chat.questions.addResources,
      resourceUploadTooLarge: "Selected resources exceed the upload limits.",
      other: "Type your own answer here",
      multilineHint: "Enter adds a line · {shortcut} to continue",
      answer: en.chat.questions.answer,
      answerPlaceholder: "{label}",
      openLink: "Open link",
      externalStepHint: "Complete the step in the new tab, then return here to submit your answer.",
      submit: "Submit",
      next: "Next",
      back: "Back",
      skip: "Skip",
      skipping: "Skipping…",
      skipped: en.chat.questions.skipped,
      collapse: "Collapse question",
      expand: "Expand question",
      eyebrow: en.chat.questions.eyebrow,
      summaryLabel: en.chat.questions.summaryLabel,
      ownAnswerFor: "Your own answer for {header}",
      storeRequestedBy: "Requested by {agent} · {session}",
      storeEntry: "Stores {name} as {kind}",
      storeReplacement: "Replaces {name} — last updated {updated}",
      storeReplacementBy: "Replaces {name} — last updated {updated} by {updatedBy}",
      submitting: "Submitting…",
      submitFailed: "Could not submit: {error}",
      answered: en.chat.questions.answered,
      answeredElsewhere: en.chat.questions.answeredElsewhere,
      unavailable: en.chat.questions.unavailable,
      expired: en.chat.questions.expired,
      disconnected: en.chat.questions.disconnected,
      loadFailed: "Could not load this question. Try again.",
    },
  },
} satisfies TranslationMap;

export const registerChatQuestionsEnglish = Object.assign(
  () => {
    Object.assign(en.chat.questions, enChatQuestions.chat.questions);
  },
  { catalog: enChatQuestions },
);
