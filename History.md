3.5 / 2013-04-22
==================

  * Extension: Use CurProcD as a fallback when referencing GRE specific files. (#115)
  * Extension: Detect the application version automatically and setup the right compatibility pref. (#52)
  * Extension: Favor the new nsIFilePicker::ShowAsync method in saveScreenshot() (#112)
  * Extension: Remove usage of nsISupportsArray due to its deprecation. (#121)
  * Extension: Use getAddonsByTypes() to only retrieve extensions for getExtensionList(). (#94)

3.4 / 2013-02-19
==================

  * Extension: Use GreD instead CurProcD to reference GRE specific files. (#115)
  * Extension: Update checkCompatibility preferences for compatibility. (#103)
  * Extension: Add privacy context to saveScreenshot() due to Bug 795065. (#99)
  * Extension: Make columns of 'Customize Titlebar' dialog's tree resizable. (#25)
  * Extension: Re-license under MPL2. (#39, #98)
  * Extension: Update 'Contributors' section automatically in about:nightly. (#58)
  * Extension: Don't register aboutNightly component for 'profile-after-change' notification. (#57)
  * Extension: Don't call callback function when iterating over Extension Manager's extensions list. (#88)
  * Extension: Include about:nightly in Nightly Tester Tools' menupopup for Thunderbird. (#56)
  * Extension: Let nightlyApp.openNotification() fallback to notificationBox in legacy Fx. (#81)
  * Extension: Open customize.xul (Customize Titlebar) as a resizable window. (#55)
  * Extension: Add pushlog-to-tip menuitem. (#61)
  * Extension: Include changeset info in the Insert/Copy Build ID menuitem and in 'Customize Titlebar'. (#65)

3.3 / 2012-05-02
==================

  * Repository: Transfer ownership of the extension from Mossop to the Automation Services team (#46)
  * Extension: Updates for extensions.checkCompatibility prefs up to 15.0a1 (#54)
  * Extension: Restart prompt for setting / resetting compatibility prefs is missing icon (#53)
  * Extension: Enable 'compatible by default' feature by not registering binary crashme components (#44)

3.2.2 / 2012-03-16
==================

  * Repository: Add Ant build script to build the extension (#35, #36)
  * Repository: Add binaries for crash me extension (#33)
  * Repository: Reorganize repository and documentation (#28)
  * Extension: Update list of contributors (#38)
  * Extension: Update maxVersions for applications (#37)
  * Extension: Allow title bar customization in Thunderbird (#24)
  * Extension: Version 3.1 loses ability to customize titlebar with just window title (#18)
  * Extension: Enhance pushlog feature to support Aurora channel (#13)
