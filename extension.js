'use strict';

const { Gio, NM, Shell } = imports.gi;
const Main = imports.ui.main;
const Lang = imports.lang;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Gettext = imports.gettext
const _ = Gettext.gettext;

// Responsible to show VLAN section and populate it with elements
const VlanManager = new Lang.Class({
    Name: 'VlanManager',

    _init: function () {
        this._client = NM.Client.new(null);
        this._createContainer()
    },

    // Create the VLAN Section on the system panel
    _createContainer: function () {
        this.container = new PopupMenu.PopupSubMenuMenuItem("VLAN", true);
        this.container.icon.icon_name = 'network-wired-symbolic';
        this.menu = this.container.menu
        Main.panel.statusArea.aggregateMenu.menu.addMenuItem(this.container, 9);

        // Register a callback when the VLAN section is pressed to open it
        this.menu.connect('open-state-changed', Lang.bind(this, function (menu, isOpen) {
            if (isOpen) this._refresh();
        }));

        this._refresh();
    },

    // Called each time the user opens or closes the VLAN section
    // Create the VLAN items and populate the menu
    _refresh: function () {
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
        vlans.forEach(Lang.bind(this, function (vlan) {
            this._add_item(vlan, active_connections.get(vlan.get_uuid()));
        }));

        return true;
    },

    // Add an item to the VLAN section
    _add_item: function (vlan, active_vlan) {
        // The connection is active when we receive and ActiveConnection object and it has an ACTIVATED state.
        let isActive = active_vlan !== undefined && active_vlan.get_state() != NM.ActiveConnectionState.DEACTIVATED;

        let switch_item = new PopupMenu.PopupSwitchMenuItem(vlan.get_id(), isActive);
        switch_item.setStatus(this._get_status(active_vlan))
        this.menu.addMenuItem(switch_item);

        // Register callback on switch toggled
        switch_item.connect('toggled', this._toggle.bind(this, vlan, active_vlan));
    },

    // Return a label corresponding to the activeConnection status
    _get_status(active_vlan) {
        if (!active_vlan)
            return null;

        switch (active_vlan.get_state()) {
            case NM.ActiveConnectionState.DEACTIVATED:
            case NM.ActiveConnectionState.ACTIVATED:
                return null;
            case NM.ActiveConnectionState.ACTIVATING:
                return _("connecting…");
            case NM.ActiveConnectionState.DEACTIVATING:
                return _("disconnecting…");
            default:
                return 'invalid';
        }
    },

    // Activate or deactivate connection when switch toggled
    _toggle: function (vlan, active_vlan) {
        if (active_vlan !== undefined)
            this._client.deactivate_connection_async(active_vlan, null, null)
        else
            this._client.activate_connection_async(vlan, null, null, null, null);
    },

    // Remove VLAN section
    destroy: function () {
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