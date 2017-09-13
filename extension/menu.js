/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

window.addEventListener('DOMContentLoaded', async event => {
  localize_page();
});

document.addEventListener('click', async event => {
  await handle_command(event.target.dataset.command);
  window.close();
});
