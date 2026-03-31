import { execSync } from 'child_process';

export type EmailFilter = {
  from?: string;
  to?: string;
  subject?: string;
  hasWord?: string;
  /** undefined = both seen and unseen, true = SEEN, false = UNSEEN */
  seen?: boolean;
  /** dd-mmm-yyyy */
  since?: string;
  /** dd-mmm-yyyy */
  before?: string;
};

/**
 * IMAP helper that uses curl (same approach as the original Cypress imap.ts).
 * Requires curl to be installed and accessible on PATH.
 */
export class ImapHelper {
  private readonly imapsUrl: string;
  private readonly isWindows: boolean;

  constructor() {
    const login = (process.env.IMAP_LOGIN || '').replace(/@/g, '%40');
    const password = process.env.IMAP_PASSWORD || '';
    const host = process.env.IMAP_HOST || '';
    const port = process.env.IMAP_PORT || '993';
    const folder = process.env.IMAP_FOLDER || 'INBOX';
    this.imapsUrl = `imaps://${login}:${password}@${host}:${port}/${folder}/`;
    this.isWindows = process.platform === 'win32';
  }

  // ── Query builder ───────────────────────────────────────────────────────────

  buildSearchCommand(filter: EmailFilter): string {
    const seen = filter.seen === undefined ? '' : filter.seen ? 'SEEN ' : 'UNSEEN ';
    const from = filter.from ? `FROM ${filter.from} ` : '';
    const to = filter.to ? `TO ${filter.to} ` : '';
    const since = filter.since ? `SINCE ${filter.since} ` : '';
    const before = filter.before ? `BEFORE ${filter.before}` : '';

    if (this.isWindows) {
      const subject = filter.subject ? `SUBJECT ""${filter.subject}"" ` : '';
      const hasWord = filter.hasWord ? `TEXT ""${filter.hasWord}"" ` : '';
      return `curl --login-options "AUTH=PLAIN" ${this.imapsUrl} -X "SEARCH ${seen}${subject}${from}${to}${hasWord}${since}${before}"`.trimEnd() + '"';
    } else {
      const subject = filter.subject ? `SUBJECT "${filter.subject}" ` : '';
      const hasWord = filter.hasWord ? `TEXT "${filter.hasWord}" ` : '';
      return `curl --login-options AUTH=PLAIN ${this.imapsUrl} -X 'SEARCH ${seen}${subject}${from}${to}${hasWord}${since}${before}`.trimEnd() + "'";
    }
  }

  // ── Synchronous operations (for use in test setup/teardown) ────────────────

  /** Returns array of email IDs matching the filter */
  search(filter: EmailFilter): string[] {
    const command = this.buildSearchCommand(filter);
    const stdout = execSync(command, { encoding: 'utf8' });
    return stdout.split(' ').filter(id => /^\d+$/.test(id.trim()));
  }

  /** Mark given email IDs as seen (read) */
  markAsSeen(ids: string[]): void {
    if (ids.length === 0) return;
    const storeCmd = this.isWindows
      ? `curl --login-options "AUTH=PLAIN" ${this.imapsUrl} -X "STORE ${ids.join(',')} +FLAGS (\\\\Seen)"`
      : `curl --login-options AUTH=PLAIN ${this.imapsUrl} -X 'STORE ${ids.join(',')} +FLAGS (\\Seen)'`;
    execSync(storeCmd, { encoding: 'utf8' });
  }

  // ── Async polling (replaces `recurse` from cypress-recurse) ────────────────

  /**
   * Polls IMAP until at least `expectedCount` emails matching `filter` are found,
   * or throws after `timeout` ms.
   */
  async waitForEmails(
    filter: EmailFilter,
    expectedCount = 1,
    options: { timeout?: number; delay?: number } = {},
  ): Promise<string[]> {
    const { timeout = 60_000, delay = 5_000 } = options;
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      const ids = this.search(filter);
      if (ids.length >= expectedCount) return ids;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    throw new Error(
      `IMAP: expected ${expectedCount} email(s) matching filter ${JSON.stringify(filter)}, but none arrived within ${timeout}ms`,
    );
  }
}
