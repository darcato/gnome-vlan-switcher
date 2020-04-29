// Always have this as the first line of your file. Google for an explanation.
'use strict';

// This is a handy import we'll use to grab our extension's object
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

// Like `init()` below, code *here* in the top-level of your script is executed
// when your extension is loaded. You MUST NOT make any changes to GNOME Shell
// here and typically you should do nothing but assign variables.
const SOME_CONSTANT = 42;


// This function is called once when your extension is loaded, not enabled. This
// is a good time to setup translations or anything else you only do once.
//
// You MUST NOT make any changes to GNOME Shell, connect any signals or add any
// MainLoop sources here.
function init() {
    log(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);
}

// This function could be called after your extension is enabled, which could
// be done from GNOME Tweaks, when you log in or when the screen is unlocked.
//
// This is when you setup any UI for your extension, change existing widgets,
// connect signals or modify GNOME Shell's behaviour.
function enable() {
    log(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);
}

// This function could be called after your extension is uninstalled, disabled
// in GNOME Tweaks, when you log out or when the screen locks.
//
// Anything you created, modifed or setup in enable() MUST be undone here. Not
// doing so is the most common reason extensions are rejected during review!
function disable() {
    log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
}