import { handleSearchEmails } from "../handlers/searchEmails";
import { handleArchiveEmails } from "../handlers/archiveEmails";
import { handleDeleteEmails } from "../handlers/deleteEmails";
import { handleClarify } from "../handlers/clarify";
import { getRegistry, resetRegistry } from "./registry";
import { ActionExecutor } from "./executor";

let executorInstance: ActionExecutor | null = null;

export function createActionEngine(): ActionExecutor {
  if (executorInstance) {
    return executorInstance;
  }

  const registry = getRegistry();

  // Register default handlers
  registry.register("search_emails", handleSearchEmails);
  registry.register("archive_emails", handleArchiveEmails);
  registry.register("delete_emails", handleDeleteEmails);
  registry.register("clarify", handleClarify);

  executorInstance = new ActionExecutor(registry);
  return executorInstance;
}

export function getActionEngine(): ActionExecutor {
  return createActionEngine();
}

export function resetActionEngine(): void {
  executorInstance = null;
  resetRegistry();
}
