import type { OpenClawConfig } from "openclaw/plugin-sdk/config-contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMocks = vi.hoisted(() => ({
  sendMessageSignal: vi.fn(),
}));

vi.mock("./send.js", async () => {
  const actual = await vi.importActual<typeof import("./send.js")>("./send.js");
  return {
    ...actual,
    sendMessageSignal: sendMocks.sendMessageSignal,
  };
});

const { deliverReplies } = await import("./monitor.js");

describe("Signal monitor reply chunking", () => {
  beforeEach(() => {
    sendMocks.sendMessageSignal.mockReset().mockResolvedValue({ messageId: "1700000000300" });
  });

  it("keeps a long code block fenced in every chunk of a tool message", async () => {
    // A verbose tool result: one header line, then a fenced file listing over the 4000-char limit.
    const listing = Array.from(
      { length: 90 },
      (_, index) =>
        `# section ${index} settings\nSECTION_${index}_PORT = ${5000 + index}  # default port`,
    ).join("\n");
    const text = `🛠️ exec: cat app/settings.py\n\`\`\`txt\n${listing}\n\`\`\``;
    expect(text.length).toBeGreaterThan(4000);

    await deliverReplies({
      cfg: {} as OpenClawConfig,
      replies: [{ text }],
      target: "+15551230000",
      baseUrl: "http://127.0.0.1:8080",
      account: "+15550009999",
      accountId: "default",
      runtime: { log: vi.fn() } as never,
      maxBytes: 8 * 1024 * 1024,
      textLimit: 4000,
      chunkMode: "length",
    });

    const chunks = sendMocks.sendMessageSignal.mock.calls.map((call) => String(call[1]));
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks.slice(1)) {
      expect(chunk.startsWith("```")).toBe(true);
    }
    for (const chunk of chunks) {
      expect((chunk.match(/```/g) ?? []).length % 2).toBe(0);
    }
  });
});
