import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

const BASE_URL = process.env.SMART_BASE_URL || '';

export class NotesPage extends BasePage {
  readonly noteCards: Locator;
  readonly noteDeleteButtons: Locator;
  readonly pinIcons: Locator;
  readonly noteEntityValues: Locator;
  readonly authorNames: Locator;
  readonly noteTexts: Locator;
  readonly entityLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.noteCards = page.locator('.cards-section .cards-section__item');
    this.noteDeleteButtons = page.locator('.cards-section .cards-section__item [data-cy="delete-button"]');
    this.pinIcons = page.locator('.an-card__header-icon');
    this.noteEntityValues = page.locator('.note-entity__value');
    this.authorNames = page.locator('[data-cy="author-name"]');
    this.noteTexts = page.locator('.note-text');
    this.entityLinks = page.locator('[data-cy="entity-link"]');
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    const waitForLoad = this.#waitForNoteResponses(2);
    await this.page.goto(`${BASE_URL}/sales/my-notes`);
    await waitForLoad;
  }

  async gotoProjectAndOpenNotes(projectId: string): Promise<void> {
    const waitForLoad = this.#waitForNoteResponse('GET', '/api/v1/me/notes');
    await this.page.goto(`${BASE_URL}/sales/my-projects/${projectId}`);
    await waitForLoad;
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  /** Deletes all notes except the last one (mirrors Cypress .each() loop) */
  async deleteAllExceptLast(): Promise<void> {
    const buttons = await this.noteDeleteButtons.all();
    for (let i = 0; i < buttons.length - 1; i++) {
      await buttons[i].click();
      await this.page.waitForTimeout(500); // brief settle matching cy.wait(500) in original
    }
  }

  async openTakeNotesPanel(): Promise<void> {
    await this.page.locator('button div', { hasText: 'Take notes' }).click();
  }

  async fillNoteText(text: string): Promise<void> {
    await this.page.locator('.note-text textarea').type(text);
  }

  async saveNote(): Promise<void> {
    const waitForPost = this.#waitForNoteResponse('POST', '/api/v1/me/notes');
    await this.page.getByText('Save note').click();
    await waitForPost;
  }

  // ── Assertions ──────────────────────────────────────────────────────────────

  async assertPinIconExists(): Promise<void> {
    await expect(this.pinIcons.first()).toBeAttached();
  }

  async assertEntityValueExists(): Promise<void> {
    await expect(this.noteEntityValues.first()).toBeAttached();
  }

  async assertAuthorNameContains(name: string): Promise<void> {
    await expect(this.authorNames.first()).toContainText(name);
  }

  async assertFirstNoteContains(text: string): Promise<void> {
    await expect(this.noteTexts.first()).toContainText(text);
  }

  async assertFirstEntityLinkContains(text: string): Promise<void> {
    await expect(this.entityLinks.first()).toContainText(text);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  #waitForNoteResponses(count: number): Promise<void> {
    const promises = Array.from({ length: count }, () =>
      this.page.waitForResponse(r =>
        r.url().includes('/api/v1/me/notes') && r.request().method() === 'GET',
      ),
    );
    return Promise.all(promises).then(() => undefined);
  }

  #waitForNoteResponse(method: string, urlFragment: string): Promise<void> {
    return this.page
      .waitForResponse(r =>
        r.url().includes(urlFragment) && r.request().method() === method,
      )
      .then(() => undefined);
  }
}
