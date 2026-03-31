import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Project card page — the detail view opened when clicking a project link.
 * Used in Y1 (activity fields) and Y4 (status change verification).
 */
export class ProjectCardPage extends BasePage {
  // ── Activity card (ca-*) locators ───────────────────────────────────────────
  readonly activityTitles: Locator;
  readonly activityInfoBlocks: Locator;
  readonly activityDates: Locator;
  readonly activityAssignDates: Locator;
  readonly activityNotes: Locator;
  readonly activityCreatedBy: Locator;
  readonly editControls: Locator;
  readonly deleteControls: Locator;

  // ── Tab / status locators (Y4) ──────────────────────────────────────────────
  readonly pastedTabButton: Locator;
  readonly statusCheckbox: Locator;
  readonly doneTabItems: Locator;

  // ── Activity form alert (Y4) ────────────────────────────────────────────────
  readonly alertCheckbox: Locator;
  readonly alertDangerText: Locator;
  readonly alertOverdueIcon: Locator;
  readonly alertSaveButton: Locator;

  // ── Date picker (Y3) ────────────────────────────────────────────────────────
  readonly addActivityButton: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly endDateDayCells: Locator;

  constructor(page: Page) {
    super(page);

    this.activityTitles = page.locator('.ca-title');
    this.activityInfoBlocks = page.locator('.ca-info');
    this.activityDates = page.locator('.ca-info__date');
    this.activityAssignDates = page.locator('.ca-info__date > b');
    this.activityNotes = page.locator('.ca-note');
    this.activityCreatedBy = page.locator('.ca-created-by');
    this.editControls = page.locator('.an-controls__item--edit');
    this.deleteControls = page.locator('.an-controls__item--delete');

    this.pastedTabButton = page.locator('[data-cy="pasted-tab-button"] .s-tab-title');
    this.statusCheckbox = page.locator('.checkbox-activity-status');
    this.doneTabItems = page.locator('.list-section--pasted .ca-title');

    this.alertCheckbox = page.locator('[role="alert"] .checkbox-activity-status');
    this.alertDangerText = page.locator('.alert-danger > .alert__body > .alert__text');
    this.alertOverdueIcon = page.locator('[role="alert"] [role="img"]');
    this.alertSaveButton = page.locator('[data-cy="save-button"]');

    this.addActivityButton = page.locator('.add-activities .btn-primary').first();
    this.startDateInput = page.locator('[data-cy="dp-start-date"]');
    this.endDateInput = page.locator('[data-cy="dp-end-date"]');
    this.endDateDayCells = page.locator('[data-cy="dp-end-date"] span.vc-day-content');
  }

  // ── Assertions ──────────────────────────────────────────────────────────────

  async assertFirstTitleMatches(pattern: RegExp): Promise<void> {
    const text = await this.activityTitles.first().innerText();
    expect(text).toMatch(pattern);
  }

  async assertResponsibleShownAs(name: string): Promise<void> {
    await expect(this.activityInfoBlocks.first()).toContainText(`Responsible: ${name}`);
  }

  async assertFirstDateMatchesPattern(pattern: RegExp): Promise<void> {
    const text = await this.activityDates.first().innerText();
    expect(text.trim()).toMatch(pattern);
  }

  async assertLastAssignDateIsValid(checkValidDate: (s: string) => boolean): Promise<void> {
    const text = await this.activityAssignDates.last().innerText();
    expect(checkValidDate(text), `Assign date "${text}" is a valid date`).toBe(true);
  }

  async assertLastNoteContains(text: string): Promise<void> {
    await expect(this.activityNotes.last()).toContainText(text);
  }

  async assertCreatedByContains(name: string): Promise<void> {
    await expect(this.activityCreatedBy.first()).toContainText(name);
  }

  async assertEditControlVisible(): Promise<void> {
    await expect(this.editControls.first()).toBeVisible();
  }

  async assertDeleteControlVisible(): Promise<void> {
    await expect(this.deleteControls.first()).toBeVisible();
  }

  // ── Status-tab assertions (Y4) ──────────────────────────────────────────────

  async assertDoneTabContains(text: string): Promise<void> {
    await expect(this.pastedTabButton).toContainText(text);
  }

  async assertStatusCheckboxIsDone(): Promise<void> {
    await expect(this.statusCheckbox.first()).toHaveClass(/checkbox-activity-status--done/);
  }

  async clickDoneTab(): Promise<void> {
    await this.page.locator('[role="tab"]', { hasText: 'Done' }).click();
  }

  async clickFirstDoneActivity(): Promise<void> {
    await this.doneTabItems.first().click();
  }

  // ── Date picker actions (Y3) ────────────────────────────────────────────────

  async fillStartDate(dateString: string): Promise<void> {
    await this.startDateInput.clear();
    await this.startDateInput.type(dateString);
  }

  async openEndDatePicker(): Promise<void> {
    await this.endDateInput.click();
  }

  /**
   * Asserts that all calendar days before `activeDay` are disabled,
   * and all days from `activeDay` onward are enabled.
   * Mirrors the `.each()` loop in Y3.
   */
  async assertEndDateCalendarFromDay(activeDay: number): Promise<void> {
    const cells = await this.endDateDayCells.all();
    let reachedActive = false;
    for (const cell of cells) {
      const text = await cell.innerText();
      const dayNum = parseInt(text.trim(), 10);
      if (isNaN(dayNum)) continue;

      if (dayNum === activeDay) reachedActive = true;
      // stop checking once we wrap past day 1 after activeDay
      if (reachedActive && dayNum === 1 && dayNum < activeDay) break;

      if (!reachedActive) {
        await expect(cell).toHaveClass(/vc-day-disabled/);
      } else {
        await expect(cell).not.toHaveClass(/vc-day-disabled/);
      }
    }
  }
}
