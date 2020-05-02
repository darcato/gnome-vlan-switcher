const Lang = imports.lang;
const PopupMenu = imports.ui.popupMenu;
const { GObject, St, Gio, NM } = imports.gi;

var PopupVlanItem  = GObject.registerClass(
class PopupVlanItem extends PopupMenu.PopupBaseMenuItem {
    _init(client, vlan, active_vlan, params) {
        super._init(params)
        this._client = client
        this._vlan = vlan
        this._active_vlan = active_vlan

        this.label = new St.Label({ text: this._vlan.get_id(), x_expand: true });
        this.label_actor = this.label;
        this.add_child(this.label);

        let hbox = new St.BoxLayout({ x_align: St.Align.END });

        this._switch = new PopupMenu.Switch(this._active_vlan != undefined && this._active_vlan.get_state() == NM.ActiveConnectionState.ACTIVATED);
        hbox.add(this._switch)

        this.add_child(hbox);

        this.connect('activate', Lang.bind(this, function(event) {
            if (this._switch.mapped) {
                this._switch.toggle();

                if (this._active_vlan != undefined && this._active_vlan.get_state() == NM.ActiveConnectionState.ACTIVATED)
                    this._client.deactivate_connection_async(this._active_vlan, null, null)
                else
                    this._client.activate_connection_async(this._vlan, null, null, null, null);
            }

        }));
    }
});
