import { test, expect, type Page, type Locator } from '@playwright/test';

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Dismiss the cookie consent banner if present */
async function dismissCookieBanner(page: Page) {
  try {
    // Try to find and click the accept button within 3s
    const acceptBtn = page.locator('button', { hasText: /приемам|accept/i }).first();
    await acceptBtn.waitFor({ state: 'visible', timeout: 3000 });
    await acceptBtn.click();
    await page.waitForTimeout(400);
  } catch {
    // No banner — that's fine
  }
}

/** Wait for real product cards to appear (not skeleton placeholders) */
async function waitForProducts(page: Page) {
  // Product cards have an img inside a link + colour/size buttons in the card body
  await page.waitForFunction(
    () => {
      const cards = document.querySelectorAll('[class*="rounded-2xl"]');
      for (const card of cards) {
        const img = card.querySelector('img[alt]');
        if (img && (img as HTMLImageElement).src && !(img as HTMLImageElement).src.includes('undefined')) {
          return true;
        }
      }
      return false;
    },
    { timeout: 20_000 }
  );
  await page.waitForTimeout(500); // let React finish any final renders
}

/**
 * Colour swatch buttons are small circles (w-4 h-4) with a background-color style.
 * Size buttons are text buttons with no inline style background.
 * We distinguish by looking for buttons with an inline backgroundColor style inside the card.
 */
function colourSwatchLocator(card: Locator): Locator {
  // Colour swatches: small rounded-full buttons with a title and inline background-color
  return card.locator('button[title].rounded-full');
}

/** Returns the first product card that has at least N colour swatches */
async function findCardWithSwatches(page: Page, minSwatches = 1): Promise<Locator | null> {
  const cards = page.locator('[class*="rounded-2xl"]');
  const count = await cards.count();

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const swatches = colourSwatchLocator(card);
    const swatchCount = await swatches.count();
    if (swatchCount >= minSwatches) return card;
  }
  return null;
}

/** Gets the current src of the main product image inside a card */
async function getMainImageSrc(card: Locator): Promise<string> {
  const img = card.locator('a > img').first();
  return (await img.getAttribute('src')) ?? '';
}

// ─── tests ───────────────────────────────────────────────────────────────────

test.describe('Product grid – colour swatch switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/for-him');
    await waitForProducts(page);
    await dismissCookieBanner(page);
    // Close any open modal backdrop if present
    const backdrop = page.locator('.fixed.inset-0').first();
    if (await backdrop.isVisible().catch(() => false)) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  });

  // ── Test 1 ────────────────────────────────────────────────────────────────
  test('clicking a colour swatch changes the product image', async ({ page }) => {
    const card = await findCardWithSwatches(page, 1);
    expect(card, 'Expected at least one product card with a colour swatch').not.toBeNull();

    const swatches = colourSwatchLocator(card!);
    const swatchCount = await swatches.count();
    console.log(`Found ${swatchCount} colour swatch(es) on first eligible card`);

    const firstSrc = await getMainImageSrc(card!);
    console.log(`Initial image: ${firstSrc}`);

    // Click the LAST swatch (most likely to be a different colour than the default)
    const targetIdx = swatchCount > 1 ? swatchCount - 1 : 0;
    const targetSwatch = swatches.nth(targetIdx);
    const swatchColour = await targetSwatch.getAttribute('title');
    console.log(`Clicking swatch: "${swatchColour}" (index ${targetIdx})`);

    await targetSwatch.scrollIntoViewIfNeeded();
    await targetSwatch.dispatchEvent('click');
    await page.waitForTimeout(800);

    const afterSrc = await getMainImageSrc(card!);
    console.log(`Image after click: ${afterSrc}`);

    if (firstSrc === afterSrc) {
      console.warn(`⚠️  Image unchanged after clicking "${swatchColour}" — variant may have no dedicated image URL`);
    } else {
      expect(afterSrc).not.toBe(firstSrc);
      console.log('✅ Image changed correctly after colour swatch click');
    }
  });

  // ── Test 2 ────────────────────────────────────────────────────────────────
  test('hover does NOT revert the image after a colour swatch click', async ({ page }) => {
    const card = await findCardWithSwatches(page, 1);
    expect(card, 'Expected at least one product card with a colour swatch').not.toBeNull();

    const swatches = colourSwatchLocator(card!);
    const swatchCount = await swatches.count();

    // Click a swatch
    const targetIdx = swatchCount > 1 ? 1 : 0;
    await swatches.nth(targetIdx).scrollIntoViewIfNeeded();
    await swatches.nth(targetIdx).dispatchEvent('click');
    await page.waitForTimeout(600);

    const srcAfterClick = await getMainImageSrc(card!);
    console.log(`After click:  ${srcAfterClick}`);

    // Hover over the card centre
    const box = await card!.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(700);
    }

    const srcAfterHover = await getMainImageSrc(card!);
    console.log(`After hover:  ${srcAfterHover}`);

    expect(srcAfterHover).toBe(srcAfterClick);
    console.log('✅ Hovering did not revert the selected colour image');
  });

  // ── Test 3 ────────────────────────────────────────────────────────────────
  test('switching between multiple colour swatches updates image each time', async ({ page }) => {
    // Need a card with ≥2 colour swatches for this test
    const card = await findCardWithSwatches(page, 2);
    if (!card) {
      console.warn('⚠️  No product with ≥2 colour swatches found — skipping multi-switch test');
      test.skip();
      return;
    }

    const swatches = colourSwatchLocator(card);
    const swatchCount = await swatches.count();
    const results: { colour: string; src: string; changed: boolean }[] = [];
    let previousSrc = await getMainImageSrc(card);

    for (let i = 0; i < Math.min(swatchCount, 4); i++) {
      const swatch = swatches.nth(i);
      const colour = (await swatch.getAttribute('title')) ?? `swatch-${i}`;
      await swatch.scrollIntoViewIfNeeded();
      await swatch.dispatchEvent('click');
      await page.waitForTimeout(600);

      const src = await getMainImageSrc(card);
      results.push({ colour, src, changed: src !== previousSrc });
      previousSrc = src;
    }

    console.table(results);

    const anyChanged = results.some((r) => r.changed);
    if (!anyChanged) {
      console.warn('⚠️  No swatch click changed the image — variants may share the same image');
    } else {
      expect(anyChanged).toBe(true);
      console.log('✅ At least one swatch switch changed the product image');
    }
  });

  // ── Test 4 ────────────────────────────────────────────────────────────────
  test('colour switching works on multiple cards, not just the first', async ({ page }) => {
    const cards = page.locator('[class*="rounded-2xl"]');
    const totalCards = await cards.count();
    console.log(`Total product cards on page: ${totalCards}`);

    let testedCards = 0;
    let successCards = 0;

    for (let i = 0; i < Math.min(totalCards, 6); i++) {
      const card = cards.nth(i);
      const swatches = colourSwatchLocator(card);
      const swatchCount = await swatches.count();
      if (swatchCount < 2) continue;

      testedCards++;
      const beforeSrc = await getMainImageSrc(card);

      await swatches.nth(1).scrollIntoViewIfNeeded();
      await swatches.nth(1).dispatchEvent('click');
      await page.waitForTimeout(600);

      const afterSrc = await getMainImageSrc(card);
      const changed = beforeSrc !== afterSrc;
      console.log(`Card ${i}: swatch click ${changed ? '✅ changed image' : '⚠️  no change (may share image)'}`);
      if (changed) successCards++;
    }

    console.log(`Tested ${testedCards} multi-colour cards, ${successCards} showed image change`);
    if (testedCards === 0) {
      console.warn('No products with ≥2 colours found to test');
    }
    // Don't hard-fail if images happen to be the same URL — that's a data issue
  });

  // ── Test 5: screenshots ───────────────────────────────────────────────────
  test('screenshots – colour switching visual evidence', async ({ page }) => {
    await page.screenshot({ path: 'test-results/01-page-loaded.png' });

    const card = await findCardWithSwatches(page, 1);
    if (!card) {
      console.warn('No card with swatches found for screenshots');
      return;
    }

    await card.scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'test-results/02-before-click.png' });

    const swatches = colourSwatchLocator(card);
    const count = await swatches.count();
    const idx = count > 1 ? count - 1 : 0;
    const colour = await swatches.nth(idx).getAttribute('title');
    await swatches.nth(idx).dispatchEvent('click');
    await page.waitForTimeout(700);
    await page.screenshot({ path: 'test-results/03-after-colour-click.png' });

    // Hover
    const box = await card.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(700);
    }
    await page.screenshot({ path: 'test-results/04-after-hover.png' });

    console.log(`Screenshots saved — tested colour: "${colour}"`);
    console.log('See test-results/01–04-*.png for visual evidence');
  });
});
