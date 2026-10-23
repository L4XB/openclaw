import type { TranslationMap } from "../lib/types.ts";
import { en } from "./en.ts";

const enMermaid = {
  chat: {
    mermaid: {
      title: "Mermaid diagram",
      options: "Diagram options",
      diagram: "Show diagram",
      source: "Show source",
      copySource: "Copy source",
      expand: "Expand diagram",
      expandNamed: "Expand diagram: {title}",
      rendering: "Rendering diagram…",
      error: "This diagram could not be rendered. Check the source or simplify the diagram.",
      rendererError: en.chat.mermaid.rendererError,
      imageError: "The diagram image could not be displayed. Reload the dashboard to try again.",
    },
  },
} satisfies TranslationMap;

export const registerMermaidEnglish = Object.assign(
  () => {
    Object.assign(en.chat.mermaid, enMermaid.chat.mermaid);
  },
  { catalog: enMermaid },
);
