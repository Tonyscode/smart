/**
 * Environment-aware helpers that mirror the Cypress `isSTG` / `getSender` utilities.
 * Set SMART_BASE_URL in your .env file to control which environment is targeted.
 */
const smartBaseUrl = process.env.SMART_BASE_URL || '';

/** true when tests run against the STG (dev) environment */
export const isSTG: boolean = /smart-dev\./.test(smartBaseUrl);

/** Email sender derived from the base URL, e.g. "info@smart.byggfakta.se" */
export function getSender(): string {
  try {
    return `info@${new URL(smartBaseUrl).hostname}`;
  } catch {
    return 'info@smart.byggfakta.se';
  }
}

/**
 * Project IDs that differ between STG and PROD.
 * Mirrors the `isSTG ? "…" : "…"` inline ternaries in the original Cypress tests.
 */
export const projectIds = {
  /** Used in Y1 – first activity creation */
  activityProject1: isSTG ? '854779' : '858671',
  /** Used in Y1 – activity with responsible coworker */
  activityProject2: isSTG ? '999295' : '1003174',
  /** Used in Y2 – notes creation */
  notesProject: isSTG ? '704321' : '919848',

  /** Expected project name for the linked-to assertion in Y2 */
  notesProjectName: isSTG
    ? 'Vybudování bytového domu A v obytném komplexu VIVUS - III. etapa'
    : 'Kerrostalot As Oy Turun Herttua',
};
