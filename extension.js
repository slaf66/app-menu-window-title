/* -*- mode: js; js-basic-offset: 4; indent-tabs-mode: tabs -*- */

/**
 * app-menu-window-title extension
 * @author: eternal-sorrow <sergamena at mail dot ru>
 *
 * Based on StatusTitleBar extension, written by @emerino
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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see {http://www.gnu.org/licenses/}.
 *
 */

const Main=imports.ui.main;
const Shell=imports.gi.Shell;
const Meta=imports.gi.Meta;
const ExtensionUtils=imports.misc.extensionUtils;
const Convenience=ExtensionUtils.getCurrentExtension().imports.convenience;

function set_title(win)
{
	/* Set title only on maximized windows */
	let win_title_only_on_maximize=_settings.get_boolean('only-on-maximize');
	let title;

	if
	(
		(win_title_only_on_maximize)&&
		(win.get_maximized()!=Meta.MaximizeFlags.BOTH)
	)
	{
		let tracker=Shell.WindowTracker.get_default();
		let app=tracker.get_window_app(win);
		title=app.get_name();	
	}
	else
	{
		title=win.get_title();
	}

	Main.panel.statusArea.appMenu._label.setText(title);
}

function init_window(win)
{
	if(!win._app_menu_win_ttl_chnd_cntn_)
		win._app_menu_win_ttl_chnd_cntn_=win.connect
		(
			"notify::title",
			on_window_title_changed
		);

	if(!win._app_menu_win_ttl_fcsd_cntn_)
		win._app_menu_win_ttl_fcsd_cntn_=win.connect
		(
			"focus",
			on_signal
		);

}

function is_application(win)
{
	let tracker=Shell.WindowTracker.get_default();
	if (win)
	{
		/* we have a reference on a meta window */
		return (tracker.is_window_interesting(win));
	}
	else
	{
		/* we check only against currently focused window */
		let workspace=global.screen.get_active_workspace();
		let focusedApp=tracker.focus_app;
		return (focusedApp && focusedApp.is_on_workspace(workspace));
	}
}

function on_signal()
{
	if (is_application())
	{
		let win=global.display.get_focus_window();
		set_title(win);
	}
}

function on_window_title_changed(win)
{
	if(win.has_focus())
		set_title(win);
}

let app_menu_changed_connection=null;
let app_maximize_connection=null;
let app_unmaximize_connection=null;
let window_created_connection=null;
let _settings=null;

function init()
{
	_settings=Convenience.getSettings();
}

function enable()
{
	app_menu_changed_connection=Main.panel.statusArea.appMenu.connect
	(
		'changed',
		on_signal
	);
	
	app_maximize_connection=global.window_manager.connect
	(
		'maximize',
		on_signal
	);

	app_unmaximize_connection=global.window_manager.connect
	(
		'unmaximize',
		on_signal
	);

	window_created_connection=global.display.connect
	(
		'window-created',
		function(display,win)
		{
			if (is_application(win))
				init_window(win);
    	}
    );
    
    global.get_window_actors().forEach
    (
    	function(win)
    	{
    		let meta_win=win.get_meta_window();
			if(meta_win && is_application(meta_win))
    			init_window(meta_win);
    	}
    );

	on_signal();
}

function disable()
{
	// disconnect signals
	if(app_menu_changed_connection)
		Main.panel.statusArea.appMenu.disconnect(app_menu_changed_connection);
	if(app_maximize_connection)
		global.window_manager.disconnect(app_maximize_connection);
	if(app_unmaximize_connection)
		global.window_manager.disconnect(app_unmaximize_connection);
	if(window_created_connection)
		global.display.disconnect(window_created_connection);

	global.get_window_actors().forEach
	(
	function(win)
		{
			let meta_win=win.get_meta_window();
			if(meta_win)
			{
				if(meta_win._app_menu_win_ttl_chnd_cntn_)
				{
					meta_win.disconnect(meta_win._app_menu_win_ttl_chnd_cntn_);
					delete meta_win._app_menu_win_ttl_chnd_cntn_;
				}

				if(meta_win._app_menu_win_ttl_fcsd_cntn_)
				{
					meta_win.disconnect(meta_win._app_menu_win_ttl_fcsd_cntn_);
					delete meta_win._app_menu_win_ttl_fcsd_cntn_;
				}
			}
		}
	);


	//change back the app menu button's label to the application name
	//(c)fmuellner
	Main.panel.statusArea.appMenu._sync();
}
