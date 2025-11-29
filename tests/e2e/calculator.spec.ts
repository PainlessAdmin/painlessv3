import { test, expect, Page } from '@playwright/test';

/**
 * PAINLESS REMOVALS CALCULATOR - COMPREHENSIVE E2E TESTS
 *
 * Coverage:
 * - All 12 steps
 * - All service types (home, office, furniture-only)
 * - All property sizes
 * - All slider positions
 * - Manual override flow
 * - Callback required flow
 * - All complications
 * - All extras
 * - Form validation
 * - Price calculations
 * - Navigation (forward/back)
 * - State persistence
 * - Mobile responsiveness
 */

// ============================================
// TEST DATA
// ============================================

const TEST_DATA = {
  contact: {
    firstName: 'John',
    lastName: 'Smith',
    phone: '07700900123',
    email: 'test@example.com',
  },
  addresses: {
    from: '42 Queens Road, Bristol',
    fromPostcode: 'BS8 1RE',
    to: '10 Downing Street, London',
    toPostcode: 'SW1A 2AA',
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

class CalculatorPage {
  constructor(private page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto('/calculator');
  }

  async getStep() {
    const indicator = await this.page
      .locator('[data-testid="step-indicator"]')
      .textContent();
    return parseInt(indicator?.match(/\d+/)?.[0] || '0');
  }

  async clickContinue() {
    await this.page.click('button:has-text("Continue")');
  }

  async clickBack() {
    await this.page.click('button:has-text("Back")');
  }

  // Step 1: Service Type
  async selectServiceType(type: 'home' | 'office' | 'clearance') {
    await this.page.click(`[data-testid="service-${type}"]`);
  }

  // Step 2: Property Size
  async selectPropertySize(size: string) {
    await this.page.click(`[data-testid="property-${size}"]`);
  }

  async selectOfficeSize(size: 'small' | 'medium' | 'large') {
    await this.page.click(`[data-testid="office-${size}"]`);
  }

  async selectFurnitureOnly() {
    await this.page.click('[data-testid="property-furniture"]');
  }

  // Step 2B: Furniture Only
  async setFurnitureItemCount(count: number) {
    const slider = this.page.locator('[data-testid="furniture-item-slider"]');
    await slider.fill(count.toString());
  }

  async setFurnitureNeeds2Person(value: boolean) {
    const card = this.page.locator(
      `[data-testid="needs-2person-${value ? 'yes' : 'no'}"]`
    );
    await card.click();
  }

  async setFurnitureHeavyItems(value: boolean) {
    const card = this.page.locator(
      `[data-testid="heavy-items-${value ? 'yes' : 'no'}"]`
    );
    await card.click();
  }

  async toggleSpecialistItem(item: string) {
    await this.page.click(`[data-testid="specialist-${item}"]`);
  }

  // Step 3: Belongings Slider
  async setSliderPosition(position: 1 | 2 | 3 | 4 | 5) {
    await this.page.click(`[data-testid="slider-position-${position}"]`);
  }

  // Step 4: Recommendation
  async acceptRecommendation() {
    await this.page.click('button:has-text("Accept")');
  }

  async adjustBelongings() {
    await this.page.click('button:has-text("Adjust")');
  }

  async openManualOverride() {
    await this.page.click('button:has-text("manual")');
  }

  async setManualVans(count: number) {
    await this.page.click(`[data-testid="manual-vans-${count}"]`);
  }

  async setManualMen(count: number) {
    await this.page.click(`[data-testid="manual-men-${count}"]`);
  }

  async submitManualOverride() {
    await this.page.click('button:has-text("Continue with")');
  }

  // Step 5: Date
  async selectDateFlexibility(type: 'fixed' | 'flexible' | 'unknown') {
    await this.page.click(`[data-testid="date-${type}"]`);
  }

  async selectDate(dayOffset: number = 14) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayOffset);
    const day = targetDate.getDate().toString();

    // Click the day in calendar
    await this.page
      .locator('button.rdp-day')
      .filter({ hasText: new RegExp(`^${day}$`) })
      .first()
      .click();
  }

  // Step 6: Complications
  async toggleComplication(
    complication: 'largeFragile' | 'stairs' | 'restrictedAccess' | 'plants'
  ) {
    await this.page.click(`[data-testid="complication-${complication}"]`);
  }

  async selectNoneComplications() {
    await this.page.click('[data-testid="complication-none"]');
  }

  // Step 7: Property Chain
  async selectPropertyChain(isChain: boolean) {
    await this.page.click(`[data-testid="chain-${isChain ? 'yes' : 'no'}"]`);
  }

  // Step 8: From Address
  async enterFromAddress(address: string) {
    await this.page.fill('[data-testid="from-address-input"]', address);
    // Wait for and click autocomplete suggestion
    await this.page.waitForSelector('.pac-item');
    await this.page.click('.pac-item:first-child');
  }

  async enterFromAddressManually(
    line1: string,
    city: string,
    postcode: string
  ) {
    await this.page.click('text=Enter manually');
    await this.page.fill('[name="line1"]', line1);
    await this.page.fill('[name="city"]', city);
    await this.page.fill('[name="postcode"]', postcode);
    await this.page.click('button:has-text("Use this address")');
  }

  // Step 9: To Address
  async enterToAddress(address: string) {
    await this.page.fill('[data-testid="to-address-input"]', address);
    await this.page.waitForSelector('.pac-item');
    await this.page.click('.pac-item:first-child');
  }

  async enterToAddressManually(line1: string, city: string, postcode: string) {
    await this.page.click('text=Enter manually');
    await this.page.fill('[name="line1"]', line1);
    await this.page.fill('[name="city"]', city);
    await this.page.fill('[name="postcode"]', postcode);
    await this.page.click('button:has-text("Use this address")');
  }

  // Step 10: Extras
  async selectPackingOption(size: string) {
    await this.page.selectOption('[id="packing"]', size);
  }

  async selectCleaningRooms(count: number) {
    await this.page.selectOption('[id="cleaning"]', count.toString());
  }

  async selectStorageSize(size: string) {
    await this.page.selectOption('[id="storage"]', size);
  }

  async addAssemblyItem(type: string, quantity: number) {
    await this.page.selectOption('[id="assembly-type"]', type);
    await this.page.fill('[id="assembly-qty"]', quantity.toString());
    await this.page.click('button:has-text("Add")');
  }

  // Step 11: Contact
  async fillContactForm(data: typeof TEST_DATA.contact) {
    await this.page.fill('[id="firstName"]', data.firstName);
    await this.page.fill('[id="lastName"]', data.lastName);
    await this.page.fill('[id="phone"]', data.phone);
    await this.page.fill('[id="email"]', data.email);
  }

  async toggleMarketingConsent(value: boolean) {
    const checkbox = this.page.locator('[id="marketing"]');
    const isChecked = await checkbox.isChecked();
    if (isChecked !== value) {
      await checkbox.click();
    }
  }

  async acceptTerms() {
    await this.page.locator('[id="gdpr"]').click();
  }

  async submitContact() {
    await this.page.click('button:has-text("Get My Quote")');
  }

  // Step 12: Quote
  async getQuotePrice() {
    const priceText = await this.page
      .locator('[data-testid="final-price"]')
      .textContent();
    return parseInt(priceText?.replace(/[£,]/g, '') || '0');
  }

  async toggleBreakdown() {
    await this.page.click('button:has-text("Price breakdown")');
  }

  async getBreakdownItem(label: string) {
    const row = this.page.locator(
      `[data-testid="breakdown-row"]:has-text("${label}")`
    );
    const value = await row
      .locator('[data-testid="breakdown-value"]')
      .textContent();
    return parseInt(value?.replace(/[£,]/g, '') || '0');
  }

  async clickBookNow() {
    await this.page.click('button:has-text("Book this date")');
  }

  async clickRequestCallback() {
    await this.page.click('button:has-text("Request a callback")');
  }

  // Assertions
  async expectStep(step: number) {
    await expect(
      this.page.locator('[data-testid="step-indicator"]')
    ).toContainText(step.toString());
  }

  async expectQuoteVisible() {
    await expect(
      this.page.locator('[data-testid="final-price"]')
    ).toBeVisible();
  }

  async expectCallbackRequired() {
    await expect(this.page.locator("text=We'll call you")).toBeVisible();
  }

  async expectValidationError(field: string) {
    await expect(
      this.page.locator(`[data-testid="error-${field}"]`)
    ).toBeVisible();
  }
}

// ============================================
// TEST SUITES
// ============================================

test.describe('Calculator - Complete Flows', () => {
  let calc: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();
  });

  test('Home removal - full flow with all extras', async ({ page }) => {
    // Step 1: Service Type
    await calc.selectServiceType('home');

    // Step 2: Property Size
    await calc.selectPropertySize('3bed-small');

    // Step 3: Belongings Slider
    await calc.setSliderPosition(3); // Average
    await calc.clickContinue();

    // Step 4: Recommendation
    await calc.acceptRecommendation();

    // Step 5: Date
    await calc.selectDateFlexibility('flexible');
    await calc.selectDate(21); // 3 weeks from now
    await calc.clickContinue();

    // Step 6: Complications
    await calc.toggleComplication('stairs');
    await calc.clickContinue();

    // Step 7: Property Chain
    await calc.selectPropertyChain(false);
    await calc.clickContinue();

    // Step 8: From Address
    await calc.enterFromAddressManually('42 Queens Road', 'Bristol', 'BS8 1RE');
    await calc.clickContinue();

    // Step 9: To Address
    await calc.enterToAddressManually(
      '10 Downing Street',
      'London',
      'SW1A 2AA'
    );
    await calc.clickContinue();

    // Step 10: Extras
    await calc.selectPackingOption('medium');
    await calc.selectCleaningRooms(4);
    await calc.clickContinue();

    // Step 11: Contact
    await calc.fillContactForm(TEST_DATA.contact);
    await calc.acceptTerms();
    await calc.submitContact();

    // Step 12: Quote
    await calc.expectQuoteVisible();
    const price = await calc.getQuotePrice();
    expect(price).toBeGreaterThan(500);
    expect(price).toBeLessThan(5000);
  });

  test('Office removal - medium office', async ({ page }) => {
    // Step 1
    await calc.selectServiceType('office');

    // Step 2 (skips to office selection)
    await calc.selectOfficeSize('medium');

    // Step 4 (skips slider for office)
    await calc.acceptRecommendation();

    // Step 5
    await calc.selectDateFlexibility('fixed');
    await calc.selectDate(30);
    await calc.clickContinue();

    // Step 6
    await calc.selectNoneComplications();
    await calc.clickContinue();

    // Step 7
    await calc.selectPropertyChain(false);
    await calc.clickContinue();

    // Step 8
    await calc.enterFromAddressManually(
      '100 Business Park',
      'Bristol',
      'BS1 1AA'
    );
    await calc.clickContinue();

    // Step 9
    await calc.enterToAddressManually(
      '200 Office Tower',
      'London',
      'EC1A 1BB'
    );
    await calc.clickContinue();

    // Step 10
    await calc.clickContinue(); // No extras

    // Step 11
    await calc.fillContactForm(TEST_DATA.contact);
    await calc.acceptTerms();
    await calc.submitContact();

    // Step 12
    await calc.expectQuoteVisible();
  });

  test('Furniture only - simple flow (no specialist)', async ({ page }) => {
    // Step 1
    await calc.selectServiceType('home');

    // Step 2
    await calc.selectFurnitureOnly();

    // Step 2B
    await calc.setFurnitureItemCount(5);
    await calc.setFurnitureNeeds2Person(true);
    await calc.setFurnitureHeavyItems(false);
    await calc.toggleSpecialistItem('none');
    await calc.clickContinue();

    // Step 5 (skips 3 & 4 for furniture only)
    await calc.selectDateFlexibility('unknown');
    await calc.clickContinue();

    // Continue through remaining steps...
    await calc.selectNoneComplications();
    await calc.clickContinue();

    await calc.selectPropertyChain(false);
    await calc.clickContinue();

    await calc.enterFromAddressManually('1 Test Street', 'Bristol', 'BS1 1AA');
    await calc.clickContinue();

    await calc.enterToAddressManually('2 Test Avenue', 'Bristol', 'BS2 2BB');
    await calc.clickContinue();

    await calc.clickContinue(); // No extras

    await calc.fillContactForm(TEST_DATA.contact);
    await calc.acceptTerms();
    await calc.submitContact();

    await calc.expectQuoteVisible();
  });

  test('Furniture only - specialist items triggers callback', async ({
    page,
  }) => {
    await calc.selectServiceType('home');
    await calc.selectFurnitureOnly();

    await calc.setFurnitureItemCount(3);
    await calc.setFurnitureNeeds2Person(false);
    await calc.setFurnitureHeavyItems(false);
    await calc.toggleSpecialistItem('piano');
    await calc.clickContinue();

    // Should jump to contact for callback
    await calc.fillContactForm(TEST_DATA.contact);
    await calc.acceptTerms();
    await calc.submitContact();

    await calc.expectCallbackRequired();
  });
});

test.describe('Calculator - Property Sizes', () => {
  let calc: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();
    await calc.selectServiceType('home');
  });

  const propertySizes = [
    'studio',
    '1bed',
    '2bed',
    '3bed-small',
    '3bed-large',
    '4bed',
    '5bed',
    '5bed-plus',
  ];

  for (const size of propertySizes) {
    test(`Property size: ${size}`, async ({ page }) => {
      await calc.selectPropertySize(size);

      // Studio skips slider
      if (size === 'studio') {
        await calc.expectStep(4);
      } else {
        await calc.expectStep(3);
        await calc.setSliderPosition(3);
        await calc.clickContinue();
      }

      // Should be on recommendation step
      await calc.expectStep(4);
    });
  }
});

test.describe('Calculator - Slider Positions', () => {
  let calc: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();
    await calc.selectServiceType('home');
    await calc.selectPropertySize('3bed-small');
  });

  const sliderPositions = [
    { position: 1 as const, label: 'Minimalist', multiplier: 0.9 },
    { position: 2 as const, label: 'Light', multiplier: 1.0 },
    { position: 3 as const, label: 'Average', multiplier: 1.0 },
    { position: 4 as const, label: 'Full', multiplier: 1.0 },
    { position: 5 as const, label: 'Packed', multiplier: 1.2 },
  ];

  for (const { position, label, multiplier } of sliderPositions) {
    test(`Slider position ${position}: ${label} (x${multiplier})`, async ({
      page,
    }) => {
      await calc.setSliderPosition(position);

      // Verify label is shown
      await expect(page.locator(`text=${label}`)).toBeVisible();

      await calc.clickContinue();
      await calc.expectStep(4);
    });
  }
});

test.describe('Calculator - Manual Override', () => {
  let calc: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();
    await calc.selectServiceType('home');
    await calc.selectPropertySize('3bed-small');
    await calc.setSliderPosition(3);
    await calc.clickContinue();
  });

  test('Manual override with valid selection', async ({ page }) => {
    await calc.openManualOverride();
    await calc.setManualVans(2);
    await calc.setManualMen(4);
    await calc.submitManualOverride();

    await calc.expectStep(5);
  });

  test('Manual override - validation: too few movers for vans', async ({
    page,
  }) => {
    await calc.openManualOverride();
    await calc.setManualVans(3);
    await calc.setManualMen(2); // Need at least 3 (1 per van)
    await calc.submitManualOverride();

    // Should show validation error
    await expect(page.locator('text=need at least')).toBeVisible();
  });

  test('Manual override - validation: too many movers for vans', async ({
    page,
  }) => {
    await calc.openManualOverride();
    await calc.setManualVans(1);
    await calc.setManualMen(5); // Max 3 per van
    await calc.submitManualOverride();

    await expect(page.locator('text=Maximum')).toBeVisible();
  });

  test('Adjust belongings goes back to slider', async ({ page }) => {
    await calc.adjustBelongings();
    await calc.expectStep(3);
  });
});

test.describe('Calculator - Complications', () => {
  let calc: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();
    await calc.selectServiceType('home');
    await calc.selectPropertySize('studio');
    await calc.acceptRecommendation();
    await calc.selectDateFlexibility('unknown');
    await calc.clickContinue();
  });

  test('Single complication: Large fragile (+7%)', async ({ page }) => {
    await calc.toggleComplication('largeFragile');
    await expect(page.locator('text=+7%')).toBeVisible();
    await calc.clickContinue();
    await calc.expectStep(7);
  });

  test('Single complication: Stairs (+7%)', async ({ page }) => {
    await calc.toggleComplication('stairs');
    await expect(page.locator('text=+7%')).toBeVisible();
  });

  test('Single complication: Restricted access (+7%)', async ({ page }) => {
    await calc.toggleComplication('restrictedAccess');
    await expect(page.locator('text=+7%')).toBeVisible();
  });

  test('Single complication: Plants (+1 van, +1 mover)', async ({ page }) => {
    await calc.toggleComplication('plants');
    await expect(page.locator('text=Additional van')).toBeVisible();
  });

  test('Multiple complications stack multiplicatively', async ({ page }) => {
    await calc.toggleComplication('largeFragile');
    await calc.toggleComplication('stairs');
    await calc.toggleComplication('restrictedAccess');

    // 1.07 x 1.07 x 1.07 = 1.225 = +22.5%
    await expect(page.locator('text=+22%')).toBeVisible();
  });

  test('None of these clears other selections', async ({ page }) => {
    await calc.toggleComplication('stairs');
    await calc.toggleComplication('plants');
    await calc.selectNoneComplications();

    // Verify checkboxes are unchecked
    const stairsCheckbox = page.locator(
      '[data-testid="complication-stairs"] input[type="checkbox"]'
    );
    await expect(stairsCheckbox).not.toBeChecked();
  });
});

test.describe('Calculator - Date Selection', () => {
  let calc: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();
    await calc.selectServiceType('home');
    await calc.selectPropertySize('studio');
    await calc.acceptRecommendation();
  });

  test('Fixed date shows calendar', async ({ page }) => {
    await calc.selectDateFlexibility('fixed');
    await expect(page.locator('.rdp, [data-testid="calendar"]')).toBeVisible();
  });

  test('Flexible date shows calendar with tip', async ({ page }) => {
    await calc.selectDateFlexibility('flexible');
    await expect(page.locator('.rdp, [data-testid="calendar"]')).toBeVisible();
    await expect(page.locator('text=better prices')).toBeVisible();
  });

  test('Unknown date skips calendar', async ({ page }) => {
    await calc.selectDateFlexibility('unknown');
    await expect(
      page.locator('.rdp, [data-testid="calendar"]')
    ).not.toBeVisible();
    await calc.clickContinue();
    await calc.expectStep(6);
  });

  test('Weekend date shows warning', async ({ page }) => {
    await calc.selectDateFlexibility('fixed');

    // Find next Saturday
    const today = new Date();
    const daysUntilSaturday = ((6 - today.getDay() + 7) % 7) || 7;
    await calc.selectDate(daysUntilSaturday);

    await expect(page.locator('text=Weekend')).toBeVisible();
  });
});

test.describe('Calculator - Property Chain', () => {
  let calc: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();
    await calc.selectServiceType('home');
    await calc.selectPropertySize('studio');
    await calc.acceptRecommendation();
    await calc.selectDateFlexibility('unknown');
    await calc.clickContinue();
    await calc.selectNoneComplications();
    await calc.clickContinue();
  });

  test('Property chain YES shows info', async ({ page }) => {
    await calc.selectPropertyChain(true);
    await expect(page.locator('text=full day')).toBeVisible();
    await calc.clickContinue();
    await calc.expectStep(8);
  });

  test('Property chain NO continues normally', async ({ page }) => {
    await calc.selectPropertyChain(false);
    await calc.clickContinue();
    await calc.expectStep(8);
  });
});

test.describe('Calculator - Extra Services', () => {
  let calc: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();

    // Quick path to extras
    await calc.selectServiceType('home');
    await calc.selectPropertySize('studio');
    await calc.acceptRecommendation();
    await calc.selectDateFlexibility('unknown');
    await calc.clickContinue();
    await calc.selectNoneComplications();
    await calc.clickContinue();
    await calc.selectPropertyChain(false);
    await calc.clickContinue();
    await calc.enterFromAddressManually('1 Test St', 'Bristol', 'BS1 1AA');
    await calc.clickContinue();
    await calc.enterToAddressManually('2 Test Ave', 'Bristol', 'BS2 2BB');
    await calc.clickContinue();
  });

  test('Packing service - all sizes', async ({ page }) => {
    const sizes = ['fragileOnly', 'small', 'medium', 'large', 'xl'];
    for (const size of sizes) {
      await calc.selectPackingOption(size);
      await expect(page.locator('[id="packing"]')).toHaveValue(size);
    }
  });

  test('Cleaning service - room count', async ({ page }) => {
    await calc.selectCleaningRooms(5);
    await expect(page.locator('[id="cleaning"]')).toHaveValue('5');

    await calc.selectCleaningRooms(2);
    await expect(page.locator('[id="cleaning"]')).toHaveValue('2');
  });

  test('Storage service - all sizes', async ({ page }) => {
    const sizes = [
      'smallWardrobe',
      'gardenShed',
      'smallBedroom',
      'standardBedroom',
      'largeBedroom',
      'oneCarGarage',
    ];

    for (const size of sizes) {
      await calc.selectStorageSize(size);
      await expect(page.locator('[id="storage"]')).toHaveValue(size);
    }
  });

  test('Assembly service - add multiple items', async ({ page }) => {
    await calc.addAssemblyItem('simple', 2);
    await calc.addAssemblyItem('complex', 1);

    const items = page.locator('[data-testid="assembly-item"]');
    await expect(items).toHaveCount(2);
  });

  test('Skip extras button works', async ({ page }) => {
    await calc.clickContinue();
    await calc.expectStep(11);
  });
});

test.describe('Calculator - Contact Form Validation', () => {
  let calc: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();

    // Quick path to contact
    await calc.selectServiceType('home');
    await calc.selectPropertySize('studio');
    await calc.acceptRecommendation();
    await calc.selectDateFlexibility('unknown');
    await calc.clickContinue();
    await calc.selectNoneComplications();
    await calc.clickContinue();
    await calc.selectPropertyChain(false);
    await calc.clickContinue();
    await calc.enterFromAddressManually('1 Test St', 'Bristol', 'BS1 1AA');
    await calc.clickContinue();
    await calc.enterToAddressManually('2 Test Ave', 'Bristol', 'BS2 2BB');
    await calc.clickContinue();
    await calc.clickContinue(); // Skip extras
  });

  test('Empty form shows all errors', async ({ page }) => {
    await calc.submitContact();

    await expect(page.locator('text=Please enter your first name')).toBeVisible();
    await expect(page.locator('text=Please enter your last name')).toBeVisible();
    await expect(page.locator('text=Please enter your phone')).toBeVisible();
    await expect(page.locator('text=Please enter your email')).toBeVisible();
    await expect(page.locator('text=Please accept')).toBeVisible();
  });

  test('Invalid phone format', async ({ page }) => {
    await calc.fillContactForm({
      ...TEST_DATA.contact,
      phone: '123', // Too short
    });
    await calc.acceptTerms();
    await calc.submitContact();

    await expect(page.locator('text=valid UK phone')).toBeVisible();
  });

  test('Invalid email format', async ({ page }) => {
    await calc.fillContactForm({
      ...TEST_DATA.contact,
      email: 'notanemail',
    });
    await calc.acceptTerms();
    await calc.submitContact();

    await expect(page.locator('text=valid email')).toBeVisible();
  });

  test('Terms not accepted', async ({ page }) => {
    await calc.fillContactForm(TEST_DATA.contact);
    // Don't accept terms
    await calc.submitContact();

    await expect(page.locator('text=Please accept')).toBeVisible();
  });

  test('Valid form submits successfully', async ({ page }) => {
    await calc.fillContactForm(TEST_DATA.contact);
    await calc.acceptTerms();
    await calc.submitContact();

    await calc.expectQuoteVisible();
  });

  test('UK phone formats accepted', async ({ page }) => {
    const validPhones = [
      '07700900123',
      '07700 900 123',
      '+447700900123',
      '+44 7700 900123',
    ];

    for (const phone of validPhones) {
      await page.reload();
      // Navigate back to contact step...
      await calc.selectServiceType('home');
      await calc.selectPropertySize('studio');
      await calc.acceptRecommendation();
      await calc.selectDateFlexibility('unknown');
      await calc.clickContinue();
      await calc.selectNoneComplications();
      await calc.clickContinue();
      await calc.selectPropertyChain(false);
      await calc.clickContinue();
      await calc.enterFromAddressManually('1 Test St', 'Bristol', 'BS1 1AA');
      await calc.clickContinue();
      await calc.enterToAddressManually('2 Test Ave', 'Bristol', 'BS2 2BB');
      await calc.clickContinue();
      await calc.clickContinue();

      await calc.fillContactForm({ ...TEST_DATA.contact, phone });
      await calc.acceptTerms();
      await calc.submitContact();

      await calc.expectQuoteVisible();
    }
  });
});

test.describe('Calculator - Quote Display', () => {
  let calc: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();

    // Complete full flow to get to quote
    await calc.selectServiceType('home');
    await calc.selectPropertySize('3bed-small');
    await calc.setSliderPosition(3);
    await calc.clickContinue();
    await calc.acceptRecommendation();
    await calc.selectDateFlexibility('flexible');
    await calc.selectDate(21);
    await calc.clickContinue();
    await calc.toggleComplication('stairs');
    await calc.clickContinue();
    await calc.selectPropertyChain(false);
    await calc.clickContinue();
    await calc.enterFromAddressManually('42 Queens Road', 'Bristol', 'BS8 1RE');
    await calc.clickContinue();
    await calc.enterToAddressManually(
      '10 Downing Street',
      'London',
      'SW1A 2AA'
    );
    await calc.clickContinue();
    await calc.selectPackingOption('medium');
    await calc.clickContinue();
    await calc.fillContactForm(TEST_DATA.contact);
    await calc.acceptTerms();
    await calc.submitContact();
  });

  test('Quote shows final price', async ({ page }) => {
    const price = await calc.getQuotePrice();
    expect(price).toBeGreaterThan(0);
  });

  test('Quote shows move summary', async ({ page }) => {
    await expect(page.locator('text=Bristol')).toBeVisible();
    await expect(page.locator('text=London')).toBeVisible();
  });

  test('Price breakdown expands', async ({ page }) => {
    await calc.toggleBreakdown();
    await expect(page.locator('text=Subtotal')).toBeVisible();
  });

  test('Breakdown includes all costs', async ({ page }) => {
    await calc.toggleBreakdown();

    await expect(page.locator('text=van')).toBeVisible();
    await expect(page.locator('text=mover')).toBeVisible();
    await expect(page.locator('text=Mileage')).toBeVisible();
  });

  test('Email confirmation shown', async ({ page }) => {
    await expect(page.locator(`text=${TEST_DATA.contact.email}`)).toBeVisible();
  });

  test('Book now button works', async ({ page }) => {
    await calc.clickBookNow();
    await expect(page).toHaveURL(/\/book/);
  });

  test('Request callback button works', async ({ page }) => {
    await calc.clickRequestCallback();
    await expect(page).toHaveURL(/\/callback/);
  });
});

test.describe('Calculator - Callback Required Flow', () => {
  let calc: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();
  });

  test('Large property (5bed+) triggers callback', async ({ page }) => {
    await calc.selectServiceType('home');
    await calc.selectPropertySize('5bed-plus');
    await calc.setSliderPosition(5); // Packed = x1.2 -> likely >2000 cubes

    // Should show callback required in recommendation step
    await expect(
      page.locator('text=call you, text=contact you, text=callback')
    ).toBeVisible();
  });

  test('Specialist items trigger callback', async ({ page }) => {
    await calc.selectServiceType('home');
    await calc.selectFurnitureOnly();
    await calc.setFurnitureItemCount(1);
    await calc.setFurnitureNeeds2Person(false);
    await calc.setFurnitureHeavyItems(false);
    await calc.toggleSpecialistItem('safe');
    await calc.clickContinue();

    await calc.fillContactForm(TEST_DATA.contact);
    await calc.acceptTerms();
    await calc.submitContact();

    await calc.expectCallbackRequired();
  });
});

test.describe('Calculator - Navigation', () => {
  let calc: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();
  });

  test('Back button returns to previous step', async ({ page }) => {
    await calc.selectServiceType('home');
    await calc.selectPropertySize('2bed');
    await calc.expectStep(3);

    await calc.clickBack();
    await calc.expectStep(2);

    await calc.clickBack();
    await calc.expectStep(1);
  });

  test('Progress bar updates correctly', async ({ page }) => {
    await calc.selectServiceType('home');
    const progress1 = await page
      .locator('[data-testid="progress-bar"]')
      .getAttribute('style');

    await calc.selectPropertySize('2bed');
    const progress2 = await page
      .locator('[data-testid="progress-bar"]')
      .getAttribute('style');

    // Progress should increase
    expect(progress2).not.toBe(progress1);
  });

  test('State persists through navigation', async ({ page }) => {
    await calc.selectServiceType('home');
    await calc.selectPropertySize('3bed-small');
    await calc.setSliderPosition(4);
    await calc.clickContinue();

    // Go back
    await calc.clickBack();
    await calc.clickBack();

    // Verify selections are preserved
    await expect(
      page.locator('[data-testid="property-3bed-small"]')
    ).toHaveClass(/selected|ring-2|border-primary/);
  });
});

test.describe('Calculator - State Persistence', () => {
  let calc: CalculatorPage;

  test('State survives page reload', async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();

    await calc.selectServiceType('home');
    await calc.selectPropertySize('2bed');
    await calc.setSliderPosition(3);
    await calc.clickContinue();

    // Reload page
    await page.reload();

    // Should restore state
    await calc.expectStep(4);
  });

  test('State clears after completion', async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();

    // Complete a quick flow
    await calc.selectServiceType('home');
    await calc.selectPropertySize('studio');
    await calc.acceptRecommendation();
    await calc.selectDateFlexibility('unknown');
    await calc.clickContinue();
    await calc.selectNoneComplications();
    await calc.clickContinue();
    await calc.selectPropertyChain(false);
    await calc.clickContinue();
    await calc.enterFromAddressManually('1 Test St', 'Bristol', 'BS1 1AA');
    await calc.clickContinue();
    await calc.enterToAddressManually('2 Test Ave', 'Bristol', 'BS2 2BB');
    await calc.clickContinue();
    await calc.clickContinue();
    await calc.fillContactForm(TEST_DATA.contact);
    await calc.acceptTerms();
    await calc.submitContact();

    await calc.expectQuoteVisible();

    // Start new quote
    await calc.goto();
    await calc.expectStep(1);
  });
});

test.describe('Calculator - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  let calc: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();
  });

  test('Service type cards stack vertically', async ({ page }) => {
    const cards = page.locator('[data-testid^="service-"]');
    await expect(cards).toHaveCount(3);

    // All cards should be visible (stacked)
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }
  });

  test('Property size grid adapts', async ({ page }) => {
    await calc.selectServiceType('home');

    // Cards should be visible and tappable
    await expect(page.locator('[data-testid="property-studio"]')).toBeVisible();
    await calc.selectPropertySize('studio');
    await calc.expectStep(4);
  });

  test('Form inputs are tappable on mobile', async ({ page }) => {
    // Navigate to contact form
    await calc.selectServiceType('home');
    await calc.selectPropertySize('studio');
    await calc.acceptRecommendation();
    await calc.selectDateFlexibility('unknown');
    await calc.clickContinue();
    await calc.selectNoneComplications();
    await calc.clickContinue();
    await calc.selectPropertyChain(false);
    await calc.clickContinue();
    await calc.enterFromAddressManually('1 Test', 'Bristol', 'BS1 1AA');
    await calc.clickContinue();
    await calc.enterToAddressManually('2 Test', 'Bristol', 'BS2 2BB');
    await calc.clickContinue();
    await calc.clickContinue();

    // Test form inputs
    const firstName = page.locator('[id="firstName"]');
    await firstName.tap();
    await firstName.fill('Test');
    await expect(firstName).toHaveValue('Test');
  });
});

test.describe('Calculator - Price Calculations', () => {
  let calc: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();
  });

  test('Slider position affects price', async ({ page }) => {
    // Test with minimalist (x0.9)
    await calc.selectServiceType('home');
    await calc.selectPropertySize('3bed-small');
    await calc.setSliderPosition(1);
    await calc.clickContinue();
    await calc.acceptRecommendation();
    await calc.selectDateFlexibility('unknown');
    await calc.clickContinue();
    await calc.selectNoneComplications();
    await calc.clickContinue();
    await calc.selectPropertyChain(false);
    await calc.clickContinue();
    await calc.enterFromAddressManually('1 A', 'Bristol', 'BS1 1AA');
    await calc.clickContinue();
    await calc.enterToAddressManually('2 B', 'Bristol', 'BS2 2BB');
    await calc.clickContinue();
    await calc.clickContinue();
    await calc.fillContactForm(TEST_DATA.contact);
    await calc.acceptTerms();
    await calc.submitContact();

    const priceMinimalist = await calc.getQuotePrice();

    // Repeat with packed (x1.2)
    await calc.goto();
    await calc.selectServiceType('home');
    await calc.selectPropertySize('3bed-small');
    await calc.setSliderPosition(5);
    await calc.clickContinue();
    await calc.acceptRecommendation();
    await calc.selectDateFlexibility('unknown');
    await calc.clickContinue();
    await calc.selectNoneComplications();
    await calc.clickContinue();
    await calc.selectPropertyChain(false);
    await calc.clickContinue();
    await calc.enterFromAddressManually('1 A', 'Bristol', 'BS1 1AA');
    await calc.clickContinue();
    await calc.enterToAddressManually('2 B', 'Bristol', 'BS2 2BB');
    await calc.clickContinue();
    await calc.clickContinue();
    await calc.fillContactForm(TEST_DATA.contact);
    await calc.acceptTerms();
    await calc.submitContact();

    const pricePacked = await calc.getQuotePrice();

    // Packed should be significantly more expensive
    expect(pricePacked).toBeGreaterThan(priceMinimalist);
  });

  test('Complications increase price', async ({ page }) => {
    // Without complications
    await calc.selectServiceType('home');
    await calc.selectPropertySize('studio');
    await calc.acceptRecommendation();
    await calc.selectDateFlexibility('unknown');
    await calc.clickContinue();
    await calc.selectNoneComplications();
    await calc.clickContinue();
    await calc.selectPropertyChain(false);
    await calc.clickContinue();
    await calc.enterFromAddressManually('1 A', 'Bristol', 'BS1 1AA');
    await calc.clickContinue();
    await calc.enterToAddressManually('2 B', 'Bristol', 'BS2 2BB');
    await calc.clickContinue();
    await calc.clickContinue();
    await calc.fillContactForm(TEST_DATA.contact);
    await calc.acceptTerms();
    await calc.submitContact();

    const priceNoComplications = await calc.getQuotePrice();

    // With complications
    await calc.goto();
    await calc.selectServiceType('home');
    await calc.selectPropertySize('studio');
    await calc.acceptRecommendation();
    await calc.selectDateFlexibility('unknown');
    await calc.clickContinue();
    await calc.toggleComplication('largeFragile');
    await calc.toggleComplication('stairs');
    await calc.clickContinue();
    await calc.selectPropertyChain(false);
    await calc.clickContinue();
    await calc.enterFromAddressManually('1 A', 'Bristol', 'BS1 1AA');
    await calc.clickContinue();
    await calc.enterToAddressManually('2 B', 'Bristol', 'BS2 2BB');
    await calc.clickContinue();
    await calc.clickContinue();
    await calc.fillContactForm(TEST_DATA.contact);
    await calc.acceptTerms();
    await calc.submitContact();

    const priceWithComplications = await calc.getQuotePrice();

    // Should be ~14% more
    expect(priceWithComplications).toBeGreaterThan(
      priceNoComplications * 1.1
    );
  });

  test('Extras add to price correctly', async ({ page }) => {
    await calc.selectServiceType('home');
    await calc.selectPropertySize('studio');
    await calc.acceptRecommendation();
    await calc.selectDateFlexibility('unknown');
    await calc.clickContinue();
    await calc.selectNoneComplications();
    await calc.clickContinue();
    await calc.selectPropertyChain(false);
    await calc.clickContinue();
    await calc.enterFromAddressManually('1 A', 'Bristol', 'BS1 1AA');
    await calc.clickContinue();
    await calc.enterToAddressManually('2 B', 'Bristol', 'BS2 2BB');
    await calc.clickContinue();

    // No extras
    await calc.clickContinue();
    await calc.fillContactForm(TEST_DATA.contact);
    await calc.acceptTerms();
    await calc.submitContact();

    const priceNoExtras = await calc.getQuotePrice();

    // With packing (580 for medium)
    await calc.goto();
    await calc.selectServiceType('home');
    await calc.selectPropertySize('studio');
    await calc.acceptRecommendation();
    await calc.selectDateFlexibility('unknown');
    await calc.clickContinue();
    await calc.selectNoneComplications();
    await calc.clickContinue();
    await calc.selectPropertyChain(false);
    await calc.clickContinue();
    await calc.enterFromAddressManually('1 A', 'Bristol', 'BS1 1AA');
    await calc.clickContinue();
    await calc.enterToAddressManually('2 B', 'Bristol', 'BS2 2BB');
    await calc.clickContinue();
    await calc.selectPackingOption('medium');
    await calc.clickContinue();
    await calc.fillContactForm(TEST_DATA.contact);
    await calc.acceptTerms();
    await calc.submitContact();

    const priceWithPacking = await calc.getQuotePrice();

    // Difference should be approximately 580 + margin
    const diff = priceWithPacking - priceNoExtras;
    expect(diff).toBeGreaterThan(500);
    expect(diff).toBeLessThan(800);
  });
});

test.describe('Calculator - Accessibility', () => {
  let calc: CalculatorPage;

  test.beforeEach(async ({ page }) => {
    calc = new CalculatorPage(page);
    await calc.goto();
  });

  test('Keyboard navigation works', async ({ page }) => {
    // Tab to first service option
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Press Enter to select
    await page.keyboard.press('Enter');

    // Should have moved to step 2
    await calc.expectStep(2);
  });

  test('Focus indicators are visible', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Check for focus ring
    const outline = await focusedElement.evaluate(
      (el) =>
        window.getComputedStyle(el).outline ||
        window.getComputedStyle(el).boxShadow
    );
    expect(outline).not.toBe('none');
  });

  test('Form labels are associated with inputs', async ({ page }) => {
    // Navigate to contact form
    await calc.selectServiceType('home');
    await calc.selectPropertySize('studio');
    await calc.acceptRecommendation();
    await calc.selectDateFlexibility('unknown');
    await calc.clickContinue();
    await calc.selectNoneComplications();
    await calc.clickContinue();
    await calc.selectPropertyChain(false);
    await calc.clickContinue();
    await calc.enterFromAddressManually('1 Test', 'Bristol', 'BS1 1AA');
    await calc.clickContinue();
    await calc.enterToAddressManually('2 Test', 'Bristol', 'BS2 2BB');
    await calc.clickContinue();
    await calc.clickContinue();

    // Click label should focus input
    await page.click('label:has-text("First name")');
    await expect(page.locator('[id="firstName"]')).toBeFocused();
  });
});
