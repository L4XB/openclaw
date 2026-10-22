import { expect, it } from "vitest";
import { createControlUiE2eArtifactDir } from "../test-helpers/control-ui-e2e-artifacts.ts";
import { installMockGateway } from "../test-helpers/control-ui-e2e.ts";
import { createControlUiSessionRow } from "../test-helpers/control-ui-session-fixtures.ts";
import { exactButton } from "./chat-flow.test-support.ts";
import { createControlUiE2eSuite } from "./control-ui-e2e-suite.test-support.ts";
import { captureFrame } from "./sidebar-assertions.test-support.ts";

const suite = createControlUiE2eSuite({ name: "Control UI goal replacement" });
const captureProof = process.env.OPENCLAW_CAPTURE_UI_PROOF === "1";

suite.define(() => {
  it("confirms replacement from the literal command and Goal picker without restarting the goal", async () => {
    const artifacts = captureProof ? createControlUiE2eArtifactDir("goal-replace") : undefined;
    if (artifacts) {
      console.log("Goal replacement screenshots:", artifacts);
    }
    await suite.withPage(
      { viewport: { width: 1440, height: 900 }, colorScheme: "light" },
      async ({ page }) => {
        const now = Date.now();
        const goal = {
          schemaVersion: 1,
          id: "deployment-goal",
          objective: "Verify the deployment checklist",
          status: "paused",
          createdAt: now - 60_000,
          updatedAt: now,
          pausedAt: now,
          tokenStart: 100,
          tokensUsed: 12_400,
          tokenBudget: 50_000,
          continuationTurns: 3,
        };
        const method = "sessions.goal.update";
        const gateway = await installMockGateway(page, {
          sessionKey: "agent:main:main",
          heldMethods: [method],
          historyMessages: [
            {
              role: "assistant",
              content: [{ type: "text", text: "The deployment checklist is paused for review." }],
            },
          ],
          sessions: [
            createControlUiSessionRow("agent:main:main", "Deployment checklist", now, {
              sessionId: "deployment-session",
              goal,
            }),
          ],
        });
        await page.goto(`${suite.server.baseUrl}chat/main`);
        const card = page.locator(".agent-chat__goal");
        await card.getByText("Goal paused", { exact: true }).waitFor();
        const input = page.locator(".agent-chat__composer-combobox textarea");
        const proposed = "Verify the deployment and write the rollout notes";
        await input.fill(`/goal ${proposed}`);
        if (artifacts) {
          await captureFrame(artifacts, "composer.png", page.locator("body"), [card, input]);
        }
        await input.press("Enter");
        const dialog = page.getByRole("dialog", { name: "Replace goal objective?" });
        await dialog.waitFor({ timeout: 5000 });
        expect(await gateway.getRequests("chat.send")).toHaveLength(0);
        if (artifacts) {
          await captureFrame(artifacts, "confirmation.png", page.locator("body"), [
            dialog,
            card,
            input,
          ]);
        }
        await exactButton(dialog, "Cancel").click();
        expect(await input.inputValue()).toBe(`/goal ${proposed}`);
        expect(await gateway.getRequests(method)).toHaveLength(0);
        if (artifacts) {
          await captureFrame(artifacts, "cancelled.png", page.locator("body"), [card, input]);
        }
        await input.press("Enter");
        await dialog.waitFor();
        await exactButton(dialog, "Replace objective").click();
        const request = await gateway.waitForRequest(method);
        expect(request.params).toMatchObject({
          action: "edit",
          goalId: goal.id,
          sessionId: "deployment-session",
          objective: proposed,
        });
        const committed = { ...goal, objective: proposed, updatedAt: now + 1 };
        await gateway.setSessionsListResponse({
          sessions: [{ ...(await gateway.getSessionRow("agent:main:main")), goal: committed }],
        });
        await gateway.resolveDeferred(method, {
          status: "updated",
          goalId: goal.id,
          goal: committed,
        });
        await expect.poll(() => input.inputValue()).toBe("");
        await expect
          .poll(() => card.locator(".agent-chat__goal-objective").textContent())
          .toBe(proposed);
        expect(await card.locator(".agent-chat__goal-label").textContent()).toBe("Goal paused");
        expect(await card.locator(".agent-chat__goal-elapsed").textContent()).toBe("1m 00s");
        expect(await gateway.getRequests("chat.send")).toHaveLength(0);
        expect(await gateway.getRequests("sessions.goal.clear")).toHaveLength(0);
        if (artifacts) {
          await captureFrame(artifacts, "saved.png", page.locator("body"), [card, input]);
        }
        // The ordinary Goal entry path submits a structured, literal objective.
        await input.fill("/goal");
        await input.press("Enter");
        await page.locator(".agent-chat__goal-mode").waitFor();
        await input.fill("Write the rollback plan");
        await exactButton(page, "Start goal").click();
        await dialog.waitFor();
        await exactButton(dialog, "Cancel").click();
        expect(await input.inputValue()).toBe("Write the rollback plan");
        expect(await exactButton(page, "Start goal").count()).toBe(1);
        expect(await gateway.getRequests(method)).toHaveLength(1);
        expect(await gateway.getRequests("chat.send")).toHaveLength(0);
        await gateway.deferNext(method);
        await exactButton(page, "Start goal").click();
        await dialog.waitFor();
        await exactButton(dialog, "Replace objective").click();
        await expect.poll(async () => (await gateway.getRequests(method)).length).toBe(2);
        expect((await gateway.getRequests(method))[1]?.params).toMatchObject({
          action: "edit",
          goalId: goal.id,
          objective: "Write the rollback plan",
        });
        const finalGoal = {
          ...committed,
          objective: "Write the rollback plan",
          updatedAt: now + 2,
        };
        await gateway.setSessionsListResponse({
          sessions: [{ ...(await gateway.getSessionRow("agent:main:main")), goal: finalGoal }],
        });
        await gateway.resolveDeferred(method, {
          status: "updated",
          goalId: goal.id,
          goal: finalGoal,
        });
        await expect.poll(() => input.inputValue()).toBe("");
        await expect.poll(() => page.locator(".agent-chat__goal-mode").count()).toBe(0);
        expect(await gateway.getRequests("chat.send")).toHaveLength(0);
      },
    );
  });
});
