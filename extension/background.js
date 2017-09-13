/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Update the title bar prefix of each window.
 */
const update_titlebar = async () => {
  const windows = await browser.windows.getAll();
  const values = await get_variable_values();
  let pref;
  let prefix = ' '; // An empty string doesn't work

  try {
    pref = await browser.storage.local.get();
  } catch (ex) {
    return;
  }

  if (pref.enable_custom_title && pref.custom_template) {
    prefix = pref.custom_template.replace(/\$\{(\w+)\}/g, (match, key) => find_value(values, key)) + ' — ';
  }

  windows.forEach(async win => {
    await browser.windows.update(win.id, { titlePreface: prefix });
  });
};

/**
 * Find a value from the variable list by its key in a case-insensitive fashion.
 * @param {Object.<String,*>} values - The current variable list.
 * @param {String} key - A key to retrieve the value.
 * @return {String} The value or an empty string if not found.
 */
const find_value = (values, key) => {
  key = key.toLowerCase();

  for (const [_key, value] of Object.entries(values)) {
    if (_key.toLowerCase() === key) {
      return value;
    }
  }

  return '';
};

/**
 * @todo Add the following Tools menu items once Bug 1272869 is solved.
browser.menus.create({
  contexts: ['tools_menu'],
  title: browser.i18n.getMessage('copy_build_info'),
  onclick: () => handle_command('copy_build_info'),
});

browser.menus.create({
  contexts: ['tools_menu'],
  title: browser.i18n.getMessage('copy_extension_list'),
  onclick: () => handle_command('copy_extension_list'),
});

browser.menus.create({
  contexts: ['tools_menu'],
  type: 'separator',
});

browser.menus.create({
  contexts: ['tools_menu'],
  title: browser.i18n.getMessage('insert_build_info'),
  onclick: () => handle_command('insert_build_info'),
});

browser.menus.create({
  contexts: ['tools_menu'],
  title: browser.i18n.getMessage('insert_extension_list'),
  onclick: () => handle_command('insert_extension_list'),
});
 */

browser.menus.create({
  contexts: ['editable'],
  title: browser.i18n.getMessage('insert_build_info_context'),
  onclick: () => handle_command('insert_build_info'),
});

browser.menus.create({
  contexts: ['editable'],
  title: browser.i18n.getMessage('insert_extension_list_context'),
  onclick: () => handle_command('insert_extension_list'),
});

browser.storage.onChanged.addListener(async () => await update_titlebar());
browser.windows.onCreated.addListener(async () => await update_titlebar());
browser.windows.onRemoved.addListener(async () => await update_titlebar());
browser.tabs.onCreated.addListener(async () => await update_titlebar());
browser.tabs.onRemoved.addListener(async () => await update_titlebar());
