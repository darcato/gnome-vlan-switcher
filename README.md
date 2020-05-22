# GNOME VLAN Switcher

### A GNOME extension to activate and deactivate VLAN connections from the system panel.

<p align="center">
    <img src="./vlan-switcher.jpg" alt="VLAN Switcher">
</p>

## Installation

### From extensions.gnome.org
This can be installed from the GNOME extensions webpage:

https://extensions.gnome.org/extension/3061/vlan-switcher/

### From source code

```
cd ~/.local/share/gnome-shell/extensions/
rm -r vlan-switcher@darcato.github.io
git clone https://github.com/darcato/gnome-vlan-switcher vlan-switcher@darcato.github.io
```
Now restart gnome-shell by opening the command prompt with `Alt+F2` and the executing command `r`.

## Usage

This will let you activate or deactivate existing VLAN connections, managed by the network manager. You first need to create the VLANs with your preferred tool, such as `nm-connection-editor`. The status of each connections is refreshed only when you open the popup menu.

## License
[GPLv3](http://www.gnu.org/licenses/gpl-3.0.en.html)
