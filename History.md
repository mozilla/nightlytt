3.8 / 2016-08-18
==================

 * Bump minVersions to Gecko 39.0 and update maxVersions (#207)
 * Drop usage of FUEL and STEEL because both are no longer supported (#205)
 * Updated and synced feature lists and updated redirect links (#188)
 * Vendor of Thunderbird should be "Mozilla" instead of being empty (#188)
 * Add pushlog feature for all branches (#51)
 * Remove non-working image host allyoucanupload.webshots.com (#188)
 * Remove reference to Screengrab extension (#188)
 * Reduce top margin of main heading in about:nightly (#188)
 * Update maxVersions for applications (#188)
 * Fix white-space issues (#188)
 * Removal of unused files (#188)
 * Sort variables alphabetically in customize.js (#172)
 * Repository: Add .editorconfig file (#174)
 * Add Russian locale (#175)
 * Fix retrieval of compiler name in case of extra dashes (#177)
 * Add new variable for visible tabs (#173)

3.7 / 2013-10-29
==================

 * Include sv-SE locale from BabelZilla (#160)
 * Move NTT appmenu entry for Firefox into the secondary pane, and place under Addons menu (#157)
 * Change toolbar button's behavior to offer copy to clipboard if no text box is selected (#153)
 * Add "Build Identifier" Toolbar Icon to SeaMonkey's main window (#154)
 * Overlay Thunderbird's AppMenu (#100)

3.6 / 2013-08-06
==================

 * Include zh-CN locales from BabelZilla. (#143)
 * Make dtd entities for Customize Title bar more localization friendly. (#140)
 * Set file extension in filepicker to avoid silent overwrites. (#124)
 * Add basic Seamonkey support to title bar customization. (#31)
 * Fix for illegal characters in MPL 2.0 headers. (#133)

3.5 / 2013-04-25
==================

 * Use CurProcD as a fallback when referencing GRE specific files. (#115)
 * Detect the application version automatically and setup the right compatibility pref. (#52)
 * Favor the new nsIFilePicker::ShowAsync method in saveScreenshot(). (#112)
 * Remove usage of nsISupportsArray due to its deprecation. (#121)
 * Use getAddonsByTypes() to only retrieve extensions for getExtensionList(). (#94)

3.4 / 2013-02-19
==================

 * Use GreD instead CurProcD to reference GRE specific files. (#115)
 * Update checkCompatibility preferences for compatibility. (#103)
 * Add privacy context to saveScreenshot() due to Bug 795065. (#99)
 * Make columns of 'Customize Title bar' dialog's tree resizable. (#25)
 * Re-license under MPL2. (#39, #98)
 * Update 'Contributors' section automatically in about:nightly. (#58)
 * Don't register aboutNightly component for 'profile-after-change' notification. (#57)
 * Don't call callback function when iterating over Extension Manager's extensions list. (#88)
 * Include about:nightly in Nightly Tester Tools' menupopup for Thunderbird. (#56)
 * Let nightlyApp.openNotification() fallback to notificationBox in legacy Fx. (#81)
 * Open customize.xul (Customize Title bar) as a resizable window. (#55)
 * Add pushlog-to-tip menuitem. (#61)
 * Include changeset info in the Insert/Copy Build ID menuitem and in 'Customize Title bar'. (#65)

3.3 / 2012-05-02
==================

 * Repository: Transfer ownership of the extension from Mossop to the Automation Services team (#46)
 * Updates for extensions.checkCompatibility prefs up to 15.0a1 (#54)
 * Restart prompt for setting / resetting compatibility prefs is missing icon (#53)
 * Enable 'compatible by default' feature by not registering binary crashme components (#44)

3.2.2 / 2012-03-16
==================

 * Repository: Add Ant build script to build the extension (#35, #36)
 * Repository: Add binaries for crash me extension (#33)
 * Repository: Reorganize repository and documentation (#28)
 * Update list of contributors (#38)
 * Update maxVersions for applications (#37)
 * Allow title bar customization in Thunderbird (#24)
 * Version 3.1 loses ability to customize title bar with just window title (#18)
 * Enhance pushlog feature to support Aurora channel (#13)
