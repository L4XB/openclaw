import type { IrcClient } from "./client.js";

// The Gateway monitor's connection per account. Sends reuse it: a second connection for the same nick
// is refused by the server and falls back to another nick.
const liveClients = new Map<string, IrcClient>();

export function registerLiveIrcClient(accountId: string, client: IrcClient): void {
  liveClients.set(accountId, client);
}

export function unregisterLiveIrcClient(accountId: string, client: IrcClient): void {
  if (liveClients.get(accountId) === client) {
    liveClients.delete(accountId);
  }
}

/** Returns the monitor's connection for the account while it is registered and ready. */
export function getLiveIrcClient(accountId: string): IrcClient | undefined {
  const client = liveClients.get(accountId);
  return client?.isReady() ? client : undefined;
}
