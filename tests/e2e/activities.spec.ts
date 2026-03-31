/**
 * Activities and Notes — translated from Cypress activity.cy.ts
 *
 * Original Cypress qase IDs:  Y1=235, Y2=236, Y3=237, Y4=370
 * Target app:  Smart (https://smart.byggfakta.se / https://smart-dev.byggfakta.se)
 *
 * Prerequisites:
 *  – Set SMART_BASE_URL, SMART_PASSWORD, ACTIVITY_USER, ACTIVITY1_USER in .env.dev
 *  – Set IMAP_* vars for Y1 email verification
 */

import { expect } from '@playwright/test';
import { smartTest } from '../../src/fixtures/smart.fixture';
import { allureHelper } from '../../src/helpers/allure.helper';
import { ImapHelper } from '../../src/helpers/imap.helper';
import { getSender, projectIds } from '../../src/helpers/env.helper';
import { checkValidDate, ACTIVITY_DATE_PATTERN } from '../../src/helpers/date.helper';

const ACTIVITY_USER = process.env.ACTIVITY_USER || 'qasmartautotest+activity@gmail.com';
const ACTIVITY1_USER = process.env.ACTIVITY1_USER || 'qasmartautotest+activity1@gmail.com';
const SMART_PASSWORD = process.env.SMART_PASSWORD || 'smartuser';

// ─────────────────────────────────────────────────────────────────────────────

smartTest.describe('Activities and notes', () => {

  /**
   * Y1 – Delete-Create activity, check responsible on activity
   *
   * Flow:
   *  1. Clear unseen emails from previous runs
   *  2. Delete all activities except the last (precondition cleanup)
   *  3. Create activity on project 1
   *  4. Create activity with responsible coworker on project 2, export to Outlook
   *  5. Verify email arrived in IMAP
   *  6. Switch to coworker account → verify assigned activity fields
   *  7. Add note text, check save/delete button visibility, save
   *  8. Change responsible back, verify created-by column
   *  9. Switch back to original user → verify assigned-to, linked project and card fields
   *
   * Note: marked as flaky in the original — retries configured at describe level
   */
  smartTest.describe('Y1 with retry', () => {
    // smartTest.describe.configure({ retries: 1 });
    smartTest(
      '#Y1: Delete-Create activity, check responsible on activity @regression',
      async ({ page, activitiesPage, smartLogin, projectCardPage }) => {

        allureHelper.setSeverity('critical');
        allureHelper.addTag('activities', 'responsible', 'email');
        allureHelper.addDescription(
          'Creates two activities (one with a responsible coworker), verifies email notification ' +
          'via IMAP, and checks all fields on both user accounts.',
        );

        const imap = new ImapHelper();
        const emailFilter = {
          from: getSender(),
          to: ACTIVITY1_USER,
          subject: 'New Smart activity',
          seen: false,
        };

        // ── Step 1: Clear unseen emails from previous runs ─────────────────────
        await allureHelper.addStep('Clear unseen notification emails', async () => {
          const existingIds = imap.search(emailFilter);
          imap.markAsSeen(existingIds);
        });

        // ── Step 2: Cleanup – delete all activities except the last ────────────
        await allureHelper.addStep('Navigate to My Activities and clear filters', async () => {
          await activitiesPage.goto();
          await activitiesPage.clearFiltersIfActive();
        });

        await allureHelper.addStep('Delete all activities except the last', async () => {
          await activitiesPage.deleteAllExceptLast();
        });

        // ── Step 3: Create first activity ──────────────────────────────────────
        await allureHelper.addStep('Create first activity on project 1', async () => {
          await activitiesPage.gotoProject(projectIds.activityProject1);
          await activitiesPage.clickAddActivity();
          await activitiesPage.fillTitle(`one ${new Date().toLocaleDateString('ru-RU')}`);
          await activitiesPage.saveActivity();
        });

        // ── Step 4: Create second activity with responsible ────────────────────
        await allureHelper.addStep('Create second activity with responsible coworker', async () => {
          await activitiesPage.gotoProject(projectIds.activityProject2);
          await page.getByText('Add activity').click();
          await activitiesPage.fillTitle('another responsible');
          await activitiesPage.selectFirstResponsible();
          await activitiesPage.saveAndExportToOutlook();
          await activitiesPage.clickSendToMyEmail();
        });

        // ── Step 5: Verify email arrived via IMAP ──────────────────────────────
        await allureHelper.addStep('Wait for notification email in IMAP', async () => {
          const ids = await imap.waitForEmails(emailFilter, 1, { timeout: 60_000, delay: 5_000 });
          expect(ids.length).toBe(1);
        });

        // ── Step 6: Switch to coworker account ────────────────────────────────
        await allureHelper.addStep(`Login as coworker (${ACTIVITY1_USER})`, async () => {
          await smartLogin.loginAs(ACTIVITY1_USER, SMART_PASSWORD);
        });

        await allureHelper.addStep('Navigate to My Activities as coworker', async () => {
          await activitiesPage.goto();
        });

        await allureHelper.addStep('Verify linked project and assigned-to for coworker', async () => {
          await activitiesPage.assertFirstLinkedToContains('Tilbygning til dagtilbud');
          await activitiesPage.assertFirstAssignedToContains('Autotest 1activity (me)');
        });

        // ── Step 7: Open activity, add note text, check buttons ───────────────
        await allureHelper.addStep('Open activity and verify save/delete button rules', async () => {
          await activitiesPage.assertFirstActivityTitleIs('another responsible');
          await activitiesPage.activityTypeLinks.first().click();

          await activitiesPage.fillNote('Control text in text area of note');
          await activitiesPage.assertSaveButtonExists();
          await activitiesPage.assertDeleteButtonNotExists();
          await activitiesPage.saveNote();
        });

        await allureHelper.addStep('Reopen activity and verify note was saved', async () => {
          await activitiesPage.activityTypeLinks.first().click();
          await activitiesPage.assertNoteTextareaHasValue('Control text in text area of note');
        });

        // ── Step 8: Change responsible back; verify created-by ────────────────
        await allureHelper.addStep('Change responsible back and verify "Save & Export" label', async () => {
          await activitiesPage.selectFirstResponsible();
          await activitiesPage.assertExportButtonContains('Save & Export to Outlook');
          await activitiesPage.saveButton.click();
        });

        await allureHelper.addStep('Clear search and verify all created-by values', async () => {
          await activitiesPage.clearSearchButton.nth(1).click();
          await activitiesPage.assertAllCreatedByEquals('Autotest activity');
        });

        // ── Step 9: Switch back to original user ──────────────────────────────
        await allureHelper.addStep(`Login back as original user (${ACTIVITY_USER})`, async () => {
          await smartLogin.loginAs(ACTIVITY_USER, SMART_PASSWORD);
        });

        await allureHelper.addStep('Verify assigned-to and linked project for original user', async () => {
          await activitiesPage.goto();
          await activitiesPage.assertFirstAssignedToContains('Autotest activity (me)');
          await expect(activitiesPage.entityLinks.nth(0)).toContainText('Tilbygning til dagtilbud');
          await activitiesPage.assertFirstLinkedToContains('Tilbygning til dagtilbud');
        });

        await allureHelper.addStep('Click linked project and verify activity fields on card', async () => {
          // Navigate to project card via linked-to link
          await Promise.all([
            page.waitForResponse(r =>
              r.url().includes('/api/v1/me/activities') && r.request().method() === 'GET',
            ),
            activitiesPage.linkedToLinks.nth(0).click(),
          ]);

          // SHARP-5506: verify all activity card fields
          await projectCardPage.assertFirstTitleMatches(/(another responsible|one)/);
          await projectCardPage.assertResponsibleShownAs('Autotest activity (me)');
          await projectCardPage.assertFirstDateMatchesPattern(ACTIVITY_DATE_PATTERN);
          await projectCardPage.assertLastAssignDateIsValid(checkValidDate);
          await projectCardPage.assertLastNoteContains('Control text in text area of note');
          await projectCardPage.assertCreatedByContains('Autotest activity (me)');
          await projectCardPage.assertEditControlVisible();
          await projectCardPage.assertDeleteControlVisible();
        });
      },
    );
  }); // end Y1 describe with retry

  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Y2 – Delete-Create notes, check creator's name and project appearance
   */


  smartTest(
    "#Y2: Delete-Create notes, check creator's name and project appearance @regression",
    async ({ notesPage }) => {

      allureHelper.setSeverity('normal');
      allureHelper.addTag('notes', 'creator', 'linked-project');
      allureHelper.addDescription(
        "Verifies that a newly created note shows the correct creator name, pin icon, " +
        "entity value, and linked project name on the My Notes page.",
      );

      // ── Precondition: remove all notes except the last ────────────────────
      await allureHelper.addStep('Navigate to My Notes', async () => {
        await notesPage.goto();
      });

      await allureHelper.addStep('Delete all notes except the last', async () => {
        await notesPage.deleteAllExceptLast();
      });

      // ── Create a note from a specific project ─────────────────────────────
      await allureHelper.addStep('Open project and create a note', async () => {
        await notesPage.gotoProjectAndOpenNotes(projectIds.notesProject);
        await notesPage.openTakeNotesPanel();
        await notesPage.fillNoteText('A text to check the textarea of a note');
        await notesPage.saveNote();
      });

      // ── Verify note fields on My Notes page ───────────────────────────────
      await allureHelper.addStep('Navigate to My Notes and verify fields', async () => {
        await notesPage.page.goto(`${process.env.SMART_BASE_URL}/sales/my-notes`);
      });

      await allureHelper.addStep('Assert pin icon exists', async () => {
        await notesPage.assertPinIconExists();
      });

      await allureHelper.addStep('Assert project name/number is shown', async () => {
        await notesPage.assertEntityValueExists();
      });

      await allureHelper.addStep("Assert creator's name is correct", async () => {
        await notesPage.assertAuthorNameContains('Autotest activity');
      });

      await allureHelper.addStep('Assert note content', async () => {
        await notesPage.assertFirstNoteContains('A text to check the textarea of a note');
      });

      await allureHelper.addStep('Assert linked project name', async () => {
        await notesPage.assertFirstEntityLinkContains(projectIds.notesProjectName);
      });
    },
  );

  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Y3 – Check the 'End date' in the modal window of an activity (SHARP-4826)
   *
   * Verifies that the end-date calendar disables all days before the chosen start date
   * and keeps days on/after it enabled.
   */
  smartTest(
    "#Y3: Check the 'End date' in the modal window of an activity, SHARP-4826 @regression",
    async ({ page, activitiesPage, projectCardPage }) => {

      allureHelper.setSeverity('normal');
      allureHelper.addTag('activities', 'date-picker', 'SHARP-4826');
      allureHelper.addDescription(
        'When a start date is set on an activity, end-date calendar days before the start date ' +
        'must be disabled.',
      );

      const middleDay = 15;
      const today = new Date();
      const targetDate = new Date(today.getFullYear(), today.getMonth(), middleDay, 12);
      // Format as "01 Jan 2026 12:00:00 GMT" style that the date picker accepts
      const dateString = targetDate.toUTCString().split(' ').slice(1, 4).join(' ');

      await allureHelper.addStep('Navigate to active projects and open first project', async () => {
        await activitiesPage.gotoProjects('?status=1');
        const firstProjectLink = page.locator('[data-cy="title"] [data-cy="entity-link"]').first();
        await firstProjectLink.click();
      });

      await allureHelper.addStep('Open Add Activity modal and set start date', async () => {
        await projectCardPage.addActivityButton.click();
        await projectCardPage.fillStartDate(dateString);
        await projectCardPage.openEndDatePicker();
      });

      await allureHelper.addStep(
        `Assert end-date calendar: days before day ${middleDay} disabled, day ${middleDay}+ enabled`,
        async () => {
          await projectCardPage.assertEndDateCalendarFromDay(middleDay);
        },
      );
    },
  );

  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Y4 – Changing activity status from 'Overdue' to 'Done' (SHARP-5847)
   *
   * Verifies the status toggle on:
   *   1. The My Activities list
   *   2. The project card (Done tab)
   *   3. Inside the activity form (alert component)
   */
  smartTest.describe('Y4 with retry', () => {
    smartTest.describe.configure({ retries: 1 });
    smartTest(
      "#Y4: Changing of an activity status from 'Overdue' to 'Done', SHARP-5847 @regression",
      async ({ activitiesPage, projectCardPage }) => {

        allureHelper.setSeverity('critical');
        allureHelper.addTag('activities', 'status', 'overdue', 'SHARP-5847');
        allureHelper.addDescription(
          'Verifies that an overdue activity can be toggled to Done and back, ' +
          'and that the status + overdue icon update consistently across list, project card, and form.',
        );

        // ── Navigate to activities in English ─────────────────────────────────
        await allureHelper.addStep('Navigate to My Activities (English locale)', async () => {
          await activitiesPage.goto('?set_language_id=1');
        });

        const statusCheckbox = activitiesPage.getLastRowStatusCheckbox();
        const startDateCell = activitiesPage.getLastRowStartDateCell();

        // ── Precondition: ensure activity is NOT done ──────────────────────────
        await allureHelper.addStep('Ensure last activity status is not Done', async () => {
          const isDone = await statusCheckbox.evaluate(
            el => el.classList.contains('checkbox-activity-status--done'),
          );
          if (isDone) {
            await statusCheckbox.click();
          }
        });

        await allureHelper.addStep('Assert activity is not Done and overdue icon is visible', async () => {
          await activitiesPage.assertStatusIsNotDone(statusCheckbox);
          await activitiesPage.assertOverdueIconVisible(startDateCell);
        });

        // ── Mark as Done ───────────────────────────────────────────────────────
        await allureHelper.addStep('Click status checkbox → mark as Done', async () => {
          await statusCheckbox.click();
        });

        await allureHelper.addStep('Assert status is Done and overdue icon disappears', async () => {
          await activitiesPage.assertStatusIsDone(statusCheckbox);
          await activitiesPage.assertOverdueIconNotVisible(startDateCell);
        });

        // ── Verify on project card ─────────────────────────────────────────────
        await allureHelper.addStep('Navigate to project card via entity link', async () => {
          await activitiesPage.getLastRowEntityLink().click();
        });

        await allureHelper.addStep('Verify Done tab and status on project card', async () => {
          await projectCardPage.assertDoneTabContains('Done');
          await projectCardPage.assertStatusCheckboxIsDone();
        });

        // ── Verify inside the activity form ────────────────────────────────────
        await allureHelper.addStep('Open Done tab and click first activity', async () => {
          await projectCardPage.clickDoneTab();
          await projectCardPage.clickFirstDoneActivity();
        });

        await allureHelper.addStep('Assert status is Done inside the form', async () => {
          await expect(projectCardPage.alertCheckbox).toHaveClass(/checkbox-activity-status--done/);
        });

        // ── Toggle back to not-done ────────────────────────────────────────────
        await allureHelper.addStep('Toggle status back to not Done (overdue)', async () => {
          await projectCardPage.alertCheckbox.click();
          await expect(projectCardPage.alertDangerText).toContainText('This activity is overdue');
          await expect(projectCardPage.alertOverdueIcon).toHaveClass(/svg-icon--activity-overdue/);
        });

        await allureHelper.addStep('Save the form', async () => {
          await Promise.all([
            activitiesPage.page.waitForResponse(r =>
              r.url().includes('/api/v1/me/activities') && r.request().method() === 'GET',
            ),
            projectCardPage.alertSaveButton.click(),
          ]);
        });

        // ── Verify status is restored on My Activities list ────────────────────
        await allureHelper.addStep('Return to My Activities and verify overdue state is restored', async () => {
          await activitiesPage.goto('?set_language_id=1');
          await activitiesPage.assertStatusIsNotDone(statusCheckbox);
          await activitiesPage.assertOverdueIconVisible(startDateCell);
        });
      },
    );
  }); // end Y4 describe with retry
});
