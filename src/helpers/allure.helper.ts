import { allure } from 'allure-playwright';

export type Severity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';

/**
 * Attach metadata to the current Allure test report.
 */
export const allureHelper = {
  addLabel(name: string, value: string): void {
    allure.label(name, value);
  },

  setSeverity(severity: Severity): void {
    allure.severity(severity);
  },

  setOwner(owner: string): void {
    allure.owner(owner);
  },

  addTag(...tags: string[]): void {
    tags.forEach(tag => allure.tag(tag));
  },

  addDescription(description: string): void {
    allure.description(description);
  },

  async addStep(name: string, action: () => Promise<void>): Promise<void> {
    return allure.step(name, action);
  },

  async attachText(name: string, content: string): Promise<void> {
    await allure.attachment(name, content, 'text/plain');
  },

  async attachJson(name: string, content: object): Promise<void> {
    await allure.attachment(name, JSON.stringify(content, null, 2), 'application/json');
  },
};
