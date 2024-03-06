import { expect, test } from '@playwright/test';

test('should appear on the page after clicking on "Add Item"', async ({ page }) => {
  // Visit homepage
  await page.goto('/');
  // Click on the jetsetter link
  await page.getByRole('link', { name: 'Jetsetter' }).click();
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  // Click on the new item input
  await page.getByTestId('new-item-input').click();
  // Fill in the input
  await page.getByTestId('new-item-input').fill('new item');
  // Click the add item button
  await page.getByTestId('add-item').click();

  const newItem = page.getByText('new item');
  expect(newItem).toBeInViewport();
});

test('should appear in the "Unpacked Items" list', async ({ page }) => {
  // Visit homepage
  await page.goto('/');
  // Click on the jetsetter link
  await page.getByRole('link', { name: 'Jetsetter' }).click();
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  // Click on the new item input
  const newItemInput = page.getByTestId('new-item-input');
  await newItemInput.click();
  // Fill in the input
  await newItemInput.fill('new item');
  // Click the add item button
  await page.getByTestId('add-item').click();

  const unpackedList = page.getByTestId('items-unpacked');
  unpackedList.getByText('new item');
});

test('should show items that match whatever is in the filter field', async ({ page }) => {
  // Visit homepage
  await page.goto('/');
  // Click on the jetsetter link
  await page.getByRole('link', { name: 'Jetsetter' }).click();
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  // Click on the filter input
  const filterInput = page.getByTestId('filter-items');
  await filterInput.click();
  // Filter by tooth text
  await filterInput.fill('tooth');

  // Grab the filtered items
  const unpackedItems = await page
    .locator('[data-testid=items-unpacked] > ul > li > label')
    .elementHandles();

  // We should only see items containing 'tooth' in their text in both lists
  const unpackedItemTexts = await Promise.all(unpackedItems.map((_) => _.innerText()));
  expect(unpackedItemTexts).toEqual(expect.arrayContaining([expect.stringMatching(/tooth/i)]));
});

test('should hide items that do not match whatever is in the filter field', async ({ page }) => {
  // Visit homepage
  await page.goto('/');
  // Click on the jetsetter link
  await page.getByRole('link', { name: 'Jetsetter' }).click();
  // Click on the filter input
  const filterInput = page.getByTestId('filter-items');
  await filterInput.click();
  // Get the initial list items
  const initialUnpackedItems = await page
    .locator('[data-testid=items-unpacked] > ul > li > label')
    .elementHandles();
  // Filter by tooth text
  await filterInput.fill('tooth');

  // Grab the filtered items
  const filteredUnpackedItems = await page
    .locator('[data-testid=items-unpacked] > ul > li > label')
    .elementHandles();

  // We should see less items than on page load
  expect(initialUnpackedItems.length).toBeGreaterThan(filteredUnpackedItems.length);

  // We should only see items containing 'tooth' in their text in both lists
  const filteredUnpackedItemTexts = await Promise.all(
    filteredUnpackedItems.map((_) => _.textContent()),
  );
  expect(filteredUnpackedItemTexts).toEqual(
    expect.arrayContaining([expect.stringMatching(/tooth/i)]),
  );
});

test('should remove all of the elements from the page', async ({ page }) => {
  // Visit homepage
  await page.goto('/');
  // Click on the jetsetter link
  await page.getByRole('link', { name: 'Jetsetter' }).click();
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  // Get the initial list items
  const initialUnpackedItems = await page
    .locator('[data-testid=items-unpacked] > ul > li > label')
    .elementHandles();

  // We should have some items on the page initially
  expect(initialUnpackedItems.length).not.toBe(0);

  // Delete all items
  await page.getByTestId('remove-all').click();

  // Grab the items after deletion
  const unpackedItemsAfterDeletion = await page
    .locator('[data-testid=items-unpacked] > ul > li > label')
    .elementHandles();
  const packedItemsAfterDeletion = await page
    .locator('[data-testid=items-packed] > ul > li > label')
    .elementHandles();

  // We should see less items than on page load
  expect(unpackedItemsAfterDeletion.length).toBe(0);
  expect(packedItemsAfterDeletion.length).toBe(0);
});

test('should have a remove button on an item that removes it from the page', async ({ page }) => {
  // Visit homepage
  await page.goto('/');
  // Click on the jetsetter link
  await page.getByRole('link', { name: 'Jetsetter' }).click();
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  // Click on the new item input
  await page.getByTestId('new-item-input').click();
  // Fill in the input
  await page.getByTestId('new-item-input').fill('new item');
  // Click the add item button
  await page.getByTestId('add-item').click();

  // We should have the item in the page
  const newItem = page.getByRole('listitem').filter({ hasText: 'new item' });
  expect(newItem).toBeInViewport();
  // We should also see a remove button
  const removeButton = newItem.getByTestId('remove');
  // We should be able to remove the item
  await removeButton.click();
  // The item should disappear from the screen
  const deletedItem = page.getByRole('listitem').filter({ hasText: 'new item' });
  expect(deletedItem).not.toBeInViewport();
});

test('should empty out the "Packed" list', async ({ page }) => {
  // Visit homepage
  await page.goto('/');
  // Click on the jetsetter link
  await page.getByRole('link', { name: 'Jetsetter' }).click();
  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Setup anchors
  const initialUnpackedItemsCount = (
    await page.locator('[data-testid=items-unpacked] > ul > li > label').elementHandles()
  ).length;
  const initialPackedItemCount = (
    await page.locator('[data-testid=items-packed] > ul > li > label').elementHandles()
  ).length;
  // We should have some items in both lists
  expect(initialUnpackedItemsCount).not.toBe(0);
  expect(initialPackedItemCount).not.toBe(0);

  // Mark all items as unpacked
  await page.getByTestId('mark-all-as-unpacked').click();

  const updatedUnpackedItemsCount = (
    await page.locator('[data-testid=items-unpacked] > ul > li > label').elementHandles()
  ).length;
  const updatedPackedItemCount = (
    await page.locator('[data-testid=items-packed] > ul > li > label').elementHandles()
  ).length;

  // Packed list should be empty
  expect(updatedPackedItemCount).toBe(0);
  // Unpacked list should contain all the items
  const totalItems = initialUnpackedItemsCount + initialPackedItemCount;
  expect(updatedUnpackedItemsCount).toBe(totalItems);
});

test('should empty out all of the items in the "Unpacked" list', async ({ page }) => {
  // Visit homepage
  await page.goto('/');
  // Click on the jetsetter link
  await page.getByRole('link', { name: 'Jetsetter' }).click();
  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Setup anchors
  const initialUnpackedItemsCount = (
    await page.locator('[data-testid=items-unpacked] > ul > li > label').elementHandles()
  ).length;
  const initialPackedItemCount = (
    await page.locator('[data-testid=items-packed] > ul > li > label').elementHandles()
  ).length;
  // We should have some items in both lists
  expect(initialUnpackedItemsCount).not.toBe(0);
  expect(initialPackedItemCount).not.toBe(0);

  // Mark all items as packed
  await page.getByTestId('mark-all-as-packed').click();

  const updatedUnpackedItemsCount = (
    await page.locator('[data-testid=items-unpacked] > ul > li > label').elementHandles()
  ).length;
  const updatedPackedItemCount = (
    await page.locator('[data-testid=items-packed] > ul > li > label').elementHandles()
  ).length;

  // Unpacked list should be empty
  expect(updatedUnpackedItemsCount).toBe(0);
  // Packed list should contain all the items
  const totalItems = initialUnpackedItemsCount + initialPackedItemCount;
  expect(updatedPackedItemCount).toBe(totalItems);
});

test('should move an individual item from "Unpacked" to "Packed"', async ({ page }) => {
  // Visit homepage
  await page.goto('/');
  // Click on the jetsetter link
  await page.getByRole('link', { name: 'Jetsetter' }).click();
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  // Get an item from the unpacked list
  const itemCheckbox = page.getByLabel('Tooth Brush');
  expect(itemCheckbox).not.toBeChecked();
  // Mark the item as packed
  await itemCheckbox.check();
  expect(itemCheckbox).toBeChecked();
});
