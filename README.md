# Nightly Tester Tools
Nightly Tester Tools is an addon for aiding testers of nightly builds of Mozilla apps like Firefox and Thunderbird. Some features are:

* Copy Build ID to Clipboard
* Copy List of Extensions to Clipboard
* Copy about:support to Pastebin
* Open Profile Folder
* Open Pushlog
* Screenshots utility
* Title bar customization
* Crash options
* Extension compatibility fixing

# Install
You can install the latest stable NTT from [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/nightly-tester-tools/). To install for development, clone the repo:

    git clone git://github.com/mozilla/nightlytt.git

then add a file titled '{8620c15f-30dc-4dba-a131-7c5d20cf4a29}' to the "extensions" directory in your [profile folder](http://kb.mozillazine.org/Profile_folder) with the text:

    ~/nightlytt/

or whatever the path to your nightlytt folder is.

To package the extension into an xpi for distribution simply `ant` and the default dev script/target will be invoked:

    ant

You can override the build number used in the filename:

    ant -Dbuild.number=1

To build for release (no build number in filename):

    ant release

# Development
All bugs are reported to the Nightly Tester Tools component at bugzilla.mozilla.org. [bug list](https://bugzilla.mozilla.org/buglist.cgi?query_format=advanced&component=Nightly%20Tester%20Tools&product=Other%20Applications), [file a bug](https://bugzilla.mozilla.org/enter_bug.cgi?product=Other%20Applications&component=Nightly%20Tester%20Tools). Check out [the wiki](https://wiki.mozilla.org/Auto-tools/Projects/NightlyTesterTools) for a list of current and proposed features and feel free to file bugs and submit patches.

This project uses [.editorconfig](http://editorconfig.org/#overview), which sets defaults for the formatting of the code. So enjoy the use of [compatible editor](http://editorconfig.org/#download). Just download and install the corresponding plugin.

# Related Add-ons:
* [Add-on Compatibility Reporter](https://addons.mozilla.org/en-US/firefox/addon/add-on-compatibility-reporter/)
* [Screengrab (fix version)](https://addons.mozilla.org/en-US/firefox/addon/screengrab-fix-version/)
