// Always have this as the first line of your file. Google for an explanation.
'use strict';

// This is a handy import we'll use to grab our extension's object
const { Gio, NM, Shell } = imports.gi;
const Main = imports.ui.main;
const Lang = imports.lang;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const PopupVlanItem = Me.imports.popupVlanItem.PopupVlanItem;

const Gettext = imports.gettext
Gettext.bindtextdomain('vlan-switcher', Me.dir.get_child('locale').get_path());
const _ = Gettext.gettext;

log(`Defining ${Me.metadata.name} version ${Me.metadata.version}`);

const VlanManager = new Lang.Class({
    Name: 'VlanManager',

    _init: function() {
        this._client = NM.Client.new(null);
        this._createContainer()
    },

    _createContainer: function() {
        this.container = new PopupMenu.PopupSubMenuMenuItem("VLAN", true);
        this.container.icon.icon_name = 'network-wired-symbolic';
        this.menu = this.container.menu
        Main.panel.statusArea.aggregateMenu.menu.addMenuItem(this.container, 9);
        
        this.container.connect('button-press-event', Lang.bind(this, function() {
            this._refresh();
        }));

        this._refresh();
    },

    _refresh: function() {
        this.menu.removeAll();
        let active_connections = new Map();
        
        let devices = this._client.get_all_devices() || [];        
        devices.filter(d => d.get_device_type() == NM.DeviceType.VLAN)
            .forEach(d => {
                let active_conn = d.get_active_connection();
                if (active_conn && active_conn.connection) {
                    active_connections.set(active_conn.connection.get_uuid(), active_conn);
                }
        });
        
        let connections = this._client.get_connections() || [];
        let vlans = connections.filter(c => c.is_type(NM.SETTING_VLAN_SETTING_NAME));
        
        if (vlans.length < 1) {
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(_("No VLAN found")));
            return true;
        }
        
        vlans.forEach(Lang.bind(this, function(vlan) {
            this.menu.addMenuItem(new PopupVlanItem(this._client, vlan, active_connections.get(vlan.get_uuid())));
        }));

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