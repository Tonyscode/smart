import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { log } from 'node:console';

const BASE_URL = process.env.SMART_BASE_URL || '';

export class ActivitiesPage extends BasePage {
  // ── List-page locators ──────────────────────────────────────────────────────
  readonly totalNumberBlock: Locator;
  readonly clearFilterLink: Locator;
  readonly activityLinks: Locator;
  readonly mainTable: Locator;

  // ── Activity editor locators ────────────────────────────────────────────────
  readonly inputTitle: Locator;
  readonly inputNote: Locator;
  readonly saveButton: Locator;
  readonly deleteButton: Locator;
  readonly editorDeleteButton: Locator;
  readonly selectResponsible: Locator;
  readonly responsibleItems: Locator;
  readonly exportButton: Locator;
  readonly sendToMyEmailButton: Locator;
  readonly clearSearchButton: Locator;

  // ── Table cell locators (scoped to tbody) ───────────────────────────────────
  readonly linkedToLinks: Locator;
  readonly assignedToCells: Locator;
  readonly activityTypeLinks: Locator;
  readonly createdByCells: Locator;
  readonly statusCheckboxes: Locator;
  readonly entityLinks: Locator;

  constructor(page: Page) {
    super(page);

    this.totalNumberBlock = page.locator('.entity-list-total-number');
    this.clearFilterLink = page.locator('[data-cy="all-total-clear-filter-link"]');
    this.activityLinks = page.locator('[data-cy="activity-type"] a');
    this.mainTable = page.locator('[data-cy="main-table"] tbody');

    this.inputTitle = page.getByTestId('input-title');
    this.inputNote = page.getByTestId('input-note');
    this.saveButton = page.getByTestId('save-button');
    this.deleteButton = page.getByTestId('delete-button');
    this.editorDeleteButton = page.locator('[data-cy="delete-button"]');
    this.selectResponsible = page.getByTestId('select-responsible');
    this.responsibleItems = page.locator('[data-cy="checked-items"] > li');
    this.exportButton = page.getByTestId('export-button');
    this.sendToMyEmailButton = page.getByText('Send to my email');
    this.clearSearchButton = page.getByTestId('button-clear-search');

    this.linkedToLinks = this.mainTable.locator('[data-cy="linked-to"] a');
    this.assignedToCells = this.mainTable.locator('[data-cy="assigned-to"]');
    this.activityTypeLinks = this.mainTable.locator('[data-cy="activity-type"] a');
    this.createdByCells = this.mainTable.locator('[data-cy="created-by"]');
    this.statusCheckboxes = this.mainTable.locator('[data-cy="status"] .checkbox-activity-status');
    this.entityLinks = this.mainTable.locator('[data-cy="entity-link"]');
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  /** Navigate to My Activities and wait for the data to load (2 GET requests, matching Cypress behaviour) */
  async goto(): Promise<void> {
    const url = `${BASE_URL}/sales/my-activities`;
    const waitForTwoLoads = this.#waitForActivityResponses(1);
    await this.page.goto(url);
    await waitForTwoLoads;
  }

  async gotoProject(projectId: string): Promise<void> {
    // const waitForLoad = this.#waitForActivityResponses(1);
    await this.page.goto(`${BASE_URL}/sales/my-projects/${projectId}`);
    // await waitForLoad;
  }

  async gotoProjects() {
    // const waitForLoad = this.#waitForActivityResponse('GET', '/api/v1/me/activities/entities');
    await this.page.goto(`${BASE_URL}/sales/my-projects`);
    // await waitForLoad;
  }

  // ── Precondition helpers ────────────────────────────────────────────────────

  /** If a filter is active, clear it so all activities are visible */
  async clearFiltersIfActive() {
    const cnt = await this.activityLinks.count();
    console.log("Clearing active filter...", cnt);
    if (await this.activityLinks.count() > 1) {
      //const waitForLoads = this.#waitForActivityResponse('GET', '/api/v3/me/activities');
      const waitForLoads = this.#waitForActivityResponses(2);
      await this.clearFilterLink.click();
      await waitForLoads;
    }
  }
  /**
   * Deletes all activities except the last one.
   * Mirrors the `.each()` loop from the Cypress test.
   */
  async deleteAllExceptLast(): Promise<void> {
    const rows = await this.activityLinks.all();
    console.log("Deleting activities, total count:", rows.length);
    for (let i = 0; i < rows.length - 1; i++) {
      console.log("row", await rows[i])
      const waitForLoad = this.#waitForActivityResponses(1);
      await rows[i].click();
      await waitForLoad;

      await expect(this.editorDeleteButton).toBeVisible();
      const waitForDelete = Promise.all([
        this.#waitForActivityResponse('DELETE', '/api/v1/me/activities/*'),
        this.#waitForActivityResponses(1),
      ]);
      await this.editorDeleteButton.click({ force: true });
      await waitForDelete;
    }
  }

  // ── Create activity ─────────────────────────────────────────────────────────

  async clickAddActivity(): Promise<void> {
    const waitForLoad = this.#waitForActivityResponses(1);
    await this.page.getByText('Add activity').click();
    await waitForLoad;
  }

  async fillTitle(title: string): Promise<void> {
    await this.inputTitle.fill(title, { force: true });
  }

  async saveActivity(): Promise<void> {
    const waitForPost = this.#waitForActivityResponse('POST', '/api/v3/me/activities');
    await this.page.locator('.btn--save').click();
    await waitForPost;
  }

  async selectFirstResponsible(): Promise<void> {
    await this.selectResponsible.click();
    await this.responsibleItems.first().click();
  }

  /** Clicks "Save & Export to Outlook" and waits for POST */
  async saveAndExportToOutlook(): Promise<void> {
    const waitForPost = this.#waitForActivityResponse('POST', '/api/v1/me/activities');
    await this.exportButton.click();
    await waitForPost;
  }

  async clickSendToMyEmail(): Promise<void> {
    await this.sendToMyEmailButton.click();
  }

  // ── In-editor actions ───────────────────────────────────────────────────────

  async fillNote(text: string): Promise<void> {
    await this.inputNote.clear();
    await this.inputNote.type(text);
  }

  async saveNote(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(1000); // brief settle (matches cy.wait(1000) in original)
  }

  async saveNoteWithApiWait(): Promise<void> {
    const waitForLoad = this.#waitForActivityResponses(1);
    await this.saveButton.click();
    await waitForLoad;
  }

  // ── Assertions ──────────────────────────────────────────────────────────────

  async assertFirstLinkedToContains(text: string): Promise<void> {
    await expect(this.linkedToLinks.first()).toContainText(text);
  }

  async assertFirstAssignedToContains(text: string): Promise<void> {
    await expect(this.assignedToCells.first()).toContainText(text);
  }

  async assertFirstActivityTitleIs(title: string): Promise<void> {
    await expect(this.activityTypeLinks.first()).toHaveText(` ${title.trim()} `);
  }

  async assertAllCreatedByEquals(expectedText: string): Promise<void> {
    const cells = await this.createdByCells.all();
    for (const cell of cells) {
      await expect(cell).toHaveText(expectedText);
    }
  }

  async assertSaveButtonExists(): Promise<void> {
    await expect(this.saveButton).toBeVisible();
  }

  async assertDeleteButtonNotExists(): Promise<void> {
    await expect(this.deleteButton).not.toBeVisible();
  }

  async assertExportButtonContains(text: string): Promise<void> {
    await expect(this.exportButton).toContainText(text);
  }

  async assertNoteTextareaHasValue(value: string): Promise<void> {
    await expect(this.page.locator('textarea')).toHaveValue(value);
  }

  // ── Status-change helpers (Y4) ──────────────────────────────────────────────

  /** Returns the status checkbox locator for the last row */
  getLastRowStatusCheckbox(): Locator {
    return this.page.locator('[data-cy="main-table"] tbody tr').last()
      .locator('[data-cy="status"] .checkbox-activity-status');
  }

  /** Returns the start-date-time cell locator for the last row */
  getLastRowStartDateCell(): Locator {
    return this.page.locator('[data-cy="main-table"] tbody tr').last()
      .locator('[data-cy="start-date-time"]');
  }

  /** Returns the entity-link locator for the last row */
  getLastRowEntityLink(): Locator {
    return this.page.locator('[data-cy="main-table"] tbody tr').last()
      .locator('[data-cy="entity-link"]');
  }

  async assertStatusIsDone(checkbox: Locator): Promise<void> {
    await expect(checkbox).toHaveClass(/checkbox-activity-status--done/);
  }

  async assertStatusIsNotDone(checkbox: Locator): Promise<void> {
    await expect(checkbox).not.toHaveClass(/checkbox-activity-status--done/);
  }

  async assertOverdueIconVisible(startDateCell: Locator): Promise<void> {
    await expect(startDateCell.locator('[role="img"]')).toBeVisible();
    await expect(startDateCell.locator('[role="img"]')).toHaveClass(/svg-icon--activity-overdue/);
  }

  async assertOverdueIconNotVisible(startDateCell: Locator): Promise<void> {
    await expect(startDateCell.locator('[role="img"]')).not.toBeVisible();
  }

  // ── Private response-wait helpers ───────────────────────────────────────────

  /** Waits for N GET responses from the activities API */
  #waitForActivityResponses(count: number): Promise<void> {
    const promises = Array.from({ length: count }, () =>
      this.page.waitForResponse(r => {
        console.log("Waiting for response, URL:", r.url(), "Method:", r.request().method());
        return r.url().includes('/me/activities') && r.request().method() === 'GET'
      },
      ),
    );
    return Promise.all(promises).then(() => undefined);
  }

  #waitForActivityResponse(method: string, urlFragment: string): Promise<void> {
    return this.page
      .waitForResponse(r =>
        r.url().includes(urlFragment) && r.request().method() === method,
      )
      .then(() => undefined);
  }

  async getFulfilledResponce(page: Page) {
    return page.waitForResponse(async (res) => {
      if (!res.url().includes('/me/activities')) {
        return false;
      }
      const responsebody = await res.json();
      console.log("Response body:", responsebody)
      // return responsebody.data.result.meta.total
      return {

        total: responsebody?.data?.length || 0,
      } as any as boolean
      // res.status() === 200 && responsebody?.data?.length > 0
    });
  }
}
