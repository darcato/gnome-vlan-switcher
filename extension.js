// Always have this as the first line of your file. Google for an explanation.
'use strict';

// This is a handy import we'll use to grab our extension's object
const ExtensionUtils = imports.misc.extensionUtils;
const { Gio, NM } = imports.gi;
const NMDeviceWired = imports.ui.status.network.NMDeviceWired
const Me = ExtensionUtils.getCurrentExtension();
var PopupExtensionItem = Me.imports.popupExtensionItem.PopupExtensionItem;
log(`Defining ${Me.metadata.name} version ${Me.metadata.version}`);

const St = imports.gi.St;
const Main = imports.ui.main;
const Lang = imports.lang;
const Shell = imports.gi.Shell;
const PopupMenu = imports.ui.popupMenu;

Gio._promisify(NM.Client, 'new_async', 'new_finish');

const VlanManager = new Lang.Class({
    Name: 'VlanManager',

    _init: function() {
        this._client = NM.Client.new(null);
        this._createContainer()
    },

    _createContainer: function() {
        this.container = new PopupMenu.PopupSubMenuMenuItem("VLAN", true);
        this.container.icon.style_class = 'system-extensions-submenu-icon';
        this.container.icon.icon_name = 'goa-panel-symbolic';
        this.menu = this.container.menu

        Main.panel.statusArea.aggregateMenu.menu.addMenuItem(this.container, 9);

        this.menu = this.container.menu
        
        this.container.connect('button-press-event', Lang.bind(this, function() {
            this._refresh();
        }));

        this._refresh();
    },

    _refresh: function() {
        this.menu.removeAll();


        let devices = this._client.get_devices() || [];
        let vlans = devices.filter(d => d instanceof NM.DeviceEthernet);
        for (let i = 0; i < vlans.length; ++i) {
            let wrapper = new NMDeviceWired(this._client, devices[i]);
            devices[i]._delegate = wrapper;
            this.menu.addMenuItem(wrapper.item);
        }

        /* let uuids = Main.extensionManager.getUuids();
        uuids.sort(function(a, b) { 
            a = Main.extensionManager.lookup(a).metadata.name.toLowerCase();
            b = Main.extensionManager.lookup(b).metadata.name.toLowerCase();

            return a < b ? -1 : (a > b ? 1 : 0);
        });

        uuids.forEach(Lang.bind(this, function(uuid) {
            this.menu.addMenuItem(new PopupExtensionItem(uuid));
        })); */

        return true;
    },

    destroy: function() {
        this.container.destroy();
    }
});




let vlanIndicator;

// This function is called once when your extension is loaded, not enabled. This
// is a good time to setup translations or anything else you only do once.
//
// You MUST NOT make any changes to GNOME Shell, connect any signals or add any
// MainLoop sources here.
function init() {
    log(`Initializing ${Me.metadata.name} version ${Me.metadata.version}`);
}

// This function could be called after your extension is enabled, which could
// be done from GNOME Tweaks, when you log in or when the screen is unlocked.
//
// This is when you setup any UI for your extension, change existing widgets,
// connect signals or modify GNOME Shell's behaviour.
function enable() {
    log(`Enabling ${Me.metadata.name} version ${Me.metadata.version}`);
    vlanIndicator = new VlanManager();
}

// This function could be called after your extension is uninstalled, disabled
// in GNOME Tweaks, when you log out or when the screen locks.
//
// Anything you created, modifed or setup in enable() MUST be undone here. Not
// doing so is the most common reason extensions are rejected during review!
function disable() {
    log(`Disabling ${Me.metadata.name} version ${Me.metadata.version}`);
    vlanIndicator.destroy();
}