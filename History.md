# Utilu Nightly Tester Tools

3.7.1.1 / 2015-09-10
====================

  * Repository: Created a repository for Utilu Nightly Tester Tools
  * Extension: Changed extension name to Utilu Nightly Tester Tools
  * Extension: Changed extension ID to {8620c15f-30dc-4dba-a131-7c5d20cf4a40}
  * Extension: Removed all partially incomplete translations
  * Extension: Removed excessive white space before line endings
  * Extension: Removed unused variables module
  * Extension: Removed references to End-of-life (EOL) extensions
  * Extension: Fixed indentation by always using spaces and never using tabs
  * Extension: Removed copy to Pastebin functionality which had become non-working due to API changes
  * Extension: Replaced non-working copy to Pastebin functionality by copy text to Clipboard functionality
  * Extension: Added spaces between the extensions when copying the list of extensions to the Clipboard
  * Extension: Removed non-working image hosts
  * Extension: Increased the size of the Customize Titlebar window
  * Extension: Improved default Customized Titlebar title
  * Extension: Optimized the order of the Customize Titlebar Variables
  * Extension: Added Customize Titlebar Variable Application Version Pretty
  * Extension: Added Customize Titlebar Variable Application Update Channel
  * Extension: Added Customize Titlebar Variable Application Update Channel Pretty (Release, ESR, beta, Aurora, Nighty, Default)
  * Extension: Added Customize Titlebar Variable Application Version and Channel
  * Extension: Added Customize Titlebar Variable Number of visible tabs
  * Extension: Fixed missing vendor in Titlebar Customization in Thunderbird
  * Extension: Marked Crash me options which do not cause a crash as such
  * Extension: Removed the unused CSS files
  * Extension: Cleaned and optimized the CSS remaining files
  * Extension: Updated and synced feature lists
  * Extension: Updated maxVersions for applications
  * Extension: Minor changes and improvements

3.7.1 / 2015-05-26
====================

  * Extension: The extension is now signed. Mozilla began requiring all extensions to be signed in order for them to be installable in Release and Beta versions of Firefox. Signing is done through addons.mozilla.org (AMO) and has become mandatory for all extensions.

3.7 / 2013-10-29
====================

  * Extension: Include sv-SE locale from BabelZilla (#160)
  * Extension: Move extension appmenu entry for Firefox into the secondary pane, and place under Addons menu (#157)
  * Extension: Change toolbar button's behavior to offer copy to clipboard if no text box is selected (#153)
  * Extension: Add "Build Identifier" Toolbar Icon to SeaMonkey's main window (#154)
  * Extension: Overlay Thunderbird's AppMenu (#100)

3.6 / 2013-08-06
====================

  * Extension: Include zh-CN locales from BabelZilla. (#143)
  * Extension: Make dtd entities for Customize Titlebar more localization friendly. (#140)
  * Extension: Set file extension in filepicker to avoid silent overwrites. (#124)
  * Extension: Add basic Seamonkey support to titlebar customization. (#31)
  * Extension: Fix for illegal characters in MPL 2.0 headers. (#133)

3.5 / 2013-04-25
====================

  * Extension: Use CurProcD as a fallback when referencing GRE specific files. (#115)
  * Extension: Detect the application version automatically and setup the right compatibility pref. (#52)
  * Extension: Favor the new nsIFilePicker::ShowAsync method in saveScreenshot(). (#112)
  * Extension: Remove usage of nsISupportsArray due to its deprecation. (#121)
  * Extension: Use getAddonsByTypes() to only retrieve extensions for getExtensionList(). (#94)

3.4 / 2013-02-19
====================

  * Extension: Use GreD instead CurProcD to reference GRE specific files. (#115)
  * Extension: Update checkCompatibility preferences for compatibility. (#103)
  * Extension: Add privacy context to saveScreenshot() due to Bug 795065. (#99)
  * Extension: Make columns of 'Customize Titlebar' dialog's tree resizable. (#25)
  * Extension: Re-license under MPL2. (#39, #98)
  * Extension: Update 'Contributors' section automatically in about:nightly. (#58)
  * Extension: Don't register aboutNightly component for 'profile-after-change' notification. (#57)
  * Extension: Don't call callback function when iterating over Extension Manager's extensions list. (#88)
  * Extension: Include about:nightly in the extensions' menupopup for Thunderbird. (#56)
  * Extension: Let nightlyApp.openNotification() fallback to notificationBox in legacy Fx. (#81)
  * Extension: Open customize.xul (Customize Titlebar) as a resizable window. (#55)
  * Extension: Add pushlog-to-tip menuitem. (#61)
  * Extension: Include changeset info in the Insert/Copy Build ID menuitem and in 'Customize Titlebar'. (#65)

3.3 / 2012-05-02
====================

  * Repository: Transfer ownership of the extension from Mossop to the Automation Services team (#46)
  * Extension: Updates for extensions.checkCompatibility prefs up to 15.0a1 (#54)
  * Extension: Restart prompt for setting / resetting compatibility prefs is missing icon (#53)
  * Extension: Enable 'compatible by default' feature by not registering binary crashme components (#44)

3.2.2 / 2012-03-16
====================

  * Repository: Add Ant build script to build the extension (#35, #36)
  * Repository: Add binaries for crash me extension (#33)
  * Repository: Reorganize repository and documentation (#28)
  * Extension: Update list of contributors (#38)
  * Extension: Update maxVersions for applications (#37)
  * Extension: Allow titlebar customization in Thunderbird (#24)
  * Extension: Version 3.1 loses ability to customize titlebar with just window title (#18)
  * Extension: Enhance pushlog feature to support Aurora channel (#13)
