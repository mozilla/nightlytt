/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const default_template = '(Build ${AppBuildID})';
let enable_custom_title = false;
let custom_template = '';
let $checkbox;
let $input;
let $tbody;

/**
 * Initialize the option view.
 */
const init_view = async () => {
  $checkbox = document.querySelector('#enable_custom_title');
  $input = document.querySelector('#custom_template');
  $tbody = document.querySelector('#variable_tbody');

  $checkbox.addEventListener('change', event => save_pref());
  $input.addEventListener('input', event => save_pref());

  try {
    const pref = await browser.storage.local.get();

    $checkbox.checked = enable_custom_title = pref.enable_custom_title || false;
    $input.value = custom_template = pref.custom_template || default_template;
  } catch (ex) {}

  for (const [key, value] of Object.entries(await get_variable_values())) {
    const $row = $tbody.insertRow();
    const $cell_key = $row.insertCell();
    const $cell_desc = $row.insertCell();
    const $cell_value = $row.insertCell();

    $row.addEventListener('click', event => insert_or_remove_variable(key));

    $cell_key.textContent = '${' + key + '}';
    $cell_desc.textContent = browser.i18n.getMessage(`variable_${key}`);
    $cell_value.textContent = value || '(unknown)';
  }
};

/**
 * Insert a variable into the custom template when a table row is clicked. If the template already contains the
 * variable, remove it instead.
 * @param {String} key - A variable name.
 */
const insert_or_remove_variable = key => {
  const str = '${' + key + '}';

  if ($input.value.includes(str)) {
    $input.value = $input.value.replace(str, '');
  } else {
    $input.value += ' ' + str;
  }

  $input.value = $input.value.trim().replace(/\s{2,}/g, ' ');

  save_pref();
};

/**
 * Save the preference and update the window title bar in background.
 */
const save_pref = async () => {
  enable_custom_title = $checkbox.checked;
  custom_template = $input.value;

  try {
    await browser.storage.local.set({ enable_custom_title, custom_template });
  } catch (ex) {}
};

window.addEventListener('DOMContentLoaded', async event => {
  localize_page();
  init_view();
});
