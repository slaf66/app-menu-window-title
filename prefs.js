/* -*- mode: js; js-basic-offset: 4; indent-tabs-mode: tabs -*- */

/**
 * app-menu-window-title extension preferences
 * @author: Shay Elkin <shay@shayel.org>
 *
 * This extension makes the AppMenuButton show the title of
 * the current focused window,instead of the application's name.
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see {http://www.gnu.org/licenses/}.
 *
 */

const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;
const Convenience = ExtensionUtils.getCurrentExtension().imports.convenience;

const Gettext = imports.gettext;
const _= Gettext.domain('gnome-shell-extensions-app-menu-window-title').gettext;
const GLib = imports.gi.GLib;


function init()
{
	let extension = ExtensionUtils.getCurrentExtension();
	let localeDir = extension.dir.get_child('locale').get_path();

	// Extension installed in .local
	if(GLib.file_test(localeDir, GLib.FileTest.EXISTS))
	{
		Gettext.bindtextdomain
		(
			'gnome-shell-extensions-app-menu-window-title',
			localeDir
		);
	}
	// Extension installed system-wide
	else {
		Gettext.bindtextdomain
		(
			'gnome-shell-extensions-app-menu-window-title',
			extension.metadata.locale
		);
	}
}

function buildPrefsWidget() {
	let settings = Convenience.getSettings();
	
	let frame = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL,
							  border_width: 10 });

	frame.add(new Gtk.Label({ label: "<b>"+_("Show title for:")+"</b>",
							  use_markup: true,
							  xalign: 0 }));

	let box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL,
							margin_left: 20 });
	
	frame.add(box);

	let current = settings.get_boolean('only-on-maximize');
	
	let allWindows = new Gtk.RadioButton({ label: _("All windows") });
	allWindows.set_active(!current);
	allWindows.connect('toggled', function(btn) {
		if(btn.get_active())
			settings.set_boolean('only-on-maximize', false);
	});
	
	let maximizedOnly = new Gtk.RadioButton({label: _("Maximized windows only"),
											 group: allWindows });
	maximizedOnly.set_active(current);
	maximizedOnly.connect('toggled', function(btn) {
		if(btn.get_active())
			settings.set_boolean('only-on-maximize', true);
	});

	box.add(allWindows);
	box.add(maximizedOnly);

	frame.show_all();
	return frame;
}


