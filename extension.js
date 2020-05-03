'use strict';

const { Gio, NM, Shell } = imports.gi;
const Main = imports.ui.main;
const Lang = imports.lang;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const PopupVlanItem = Me.imports.popupVlanItem.PopupVlanItem;

const Gettext = imports.gettext
const _ = Gettext.gettext;

// Responsible to show VLAN section and populate it with elements
const VlanManager = new Lang.Class({
    Name: 'VlanManager',

    _init: function() {
        this._client = NM.Client.new(null);
        this._createContainer()
    },

    // Create the VLAN Section on the system panel
    _createContainer: function() {
        this.container = new PopupMenu.PopupSubMenuMenuItem("VLAN", true);
        this.container.icon.icon_name = 'network-wired-symbolic';
        this.menu = this.container.menu
        Main.panel.statusArea.aggregateMenu.menu.addMenuItem(this.container, 9);
        
        // Register a callback when the VLAN section is pressed to open it
        this.container.connect('button-press-event', Lang.bind(this, function() {
            this._refresh();
        }));

        this._refresh();
    },

    // Called each time the user opens or closes the VLAN section
    // Create the VLAN items as populate the menu
    _refresh: function() {
        this.menu.removeAll();
        let active_connections = new Map();
        
        // Get VLAN devices and save any active connection
        let devices = this._client.get_all_devices() || [];        
        devices.filter(d => d.get_device_type() == NM.DeviceType.VLAN)
            .forEach(d => {
                let active_conn = d.get_active_connection();
                if (active_conn && active_conn.connection) {
                    active_connections.set(active_conn.connection.get_uuid(), active_conn);
                }
        });
        
        // Get all VLAN connections
        let connections = this._client.get_connections() || [];
        let vlans = connections.filter(c => c.is_type(NM.SETTING_VLAN_SETTING_NAME));
        
        // If no VLAN, populate with a message
        if (vlans.length < 1) {
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(_("No VLAN found")));
            return true;
        }
        
        // Else, add one item for each VLAN
        vlans.forEach(Lang.bind(this, function(vlan) {
            this.menu.addMenuItem(new PopupVlanItem(this._client, vlan, active_connections.get(vlan.get_uuid())));
        }));

        return true;
    },

    // Remove VLAN section
    destroy: function() {
        this.container.destroy();
    }
});


let vlanIndicator;

// When the extension is installed
function init() {
    Gettext.bindtextdomain('vlan-switcher', Me.dir.get_child('locale').get_path());
}

// When the user enables this extension
function enable() {
    vlanIndicator = new VlanManager();
}

// When the user disables this extension
function disable() {
    vlanIndicator.destroy();
}