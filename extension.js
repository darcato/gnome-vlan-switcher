'use strict';

const { GObject, NM } = imports.gi;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;

// Responsible to show VLAN section and populate it with elements
var VlanManager = GObject.registerClass(
    {
        GTypeName: 'VlanManager',
    }, 
    class VlanManager extends GObject.Object {
        _init() {
            super._init();
            this._client = NM.Client.new(null);
            this._createContainer();
        }

        // Create the VLAN Section on the system panel
        _createContainer() {
            this.container = new PopupMenu.PopupSubMenuMenuItem("VLAN", true);
            this.container.icon.icon_name = 'network-wired-symbolic';
            this.menu = this.container.menu;
            Main.panel.statusArea.aggregateMenu.menu.addMenuItem(this.container, 9);
    
            // Register a callback when the VLAN section is pressed to open it
            this.menu.connect('open-state-changed', (menu, isOpen) => {
                if (isOpen) this._refresh();
            });
    
            this._refresh();
        }

        // Called each time the user opens or closes the VLAN section
        // Create the VLAN items and populate the menu
        _refresh() {
            this.menu.removeAll();

            // Store all ActiveConnections objects for each vlan
            let active_vlans = new Map();
            let active_connections = this._client.get_active_connections() || [];
            active_connections.filter(ac => ac && ac.connection && ac.connection.is_type(NM.SETTING_VLAN_SETTING_NAME))
                .forEach(ac => active_vlans.set(ac.connection.get_uuid(), ac));

            // Get all VLAN connections
            let connections = this._client.get_connections() || [];
            let vlans = connections.filter(c => c.is_type(NM.SETTING_VLAN_SETTING_NAME))
                .sort((a, b) => a.get_id() > b.get_id() ? 1 : -1);

            // If no VLAN, populate with a message
            if (vlans.length < 1) {
                this.menu.addMenuItem(new PopupMenu.PopupMenuItem(_("No VLAN found")));
                return true;
            }

            // Else, add one item for each VLAN
            vlans.forEach((vlan) => {
                this._add_item(vlan, active_vlans.get(vlan.get_uuid()));
            });

            return true;
        }

        // Add an item to the VLAN section
        _add_item(vlan, active_vlan) {
            // The connection is active when we receive and ActiveConnection object and it has an ACTIVATED state.
            let isActive = active_vlan !== undefined && active_vlan.get_state() != NM.ActiveConnectionState.DEACTIVATED;

            let switch_item = new PopupMenu.PopupSwitchMenuItem(vlan.get_id(), isActive);
            switch_item.setStatus(this._get_status(active_vlan));
            this.menu.addMenuItem(switch_item);

            // Register callback on switch toggled
            switch_item.connect('toggled', this._toggle.bind(this, vlan, active_vlan));
        }

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
        }

        // Activate or deactivate connection when switch toggled
        _toggle(vlan, active_vlan) {
            if (active_vlan !== undefined)
                this._client.deactivate_connection_async(active_vlan, null, null);
            else
                this._client.activate_connection_async(vlan, null, null, null, null);
        }

        // Remove VLAN section
        destroy() {
            this.container.destroy();
        }

    }
);

let vlanIndicator;

// When the extension is installed
function init() {
    ExtensionUtils.initTranslations(Me.metadata.uuid);
}

// When the user enables this extension
function enable() {
    vlanIndicator = new VlanManager();
}

// When the user disables this extension
function disable() {
    vlanIndicator.destroy();
    vlanIndicator = null;
}