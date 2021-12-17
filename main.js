const
{ app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, clipboard } = require( 'electron' )

const
isMac = process.platform === 'darwin'
const
isWin = process.platform === 'win32'

const
Send = ( ...$ ) => {
	const _ = BrowserWindow.getFocusedWindow()
	_ && _.send( ...$ )
}

const
SendMenu = ( ...$ ) => Send( 'menu', ...$ )

const
createWindow = file => {

	const 
	$ = new BrowserWindow(
		{	width			: 1600
		,	height			: 800
		,	title			: file ? file : 'untitled'
		,	webPreferences	: {
				preload		: require( 'path' ).join( __dirname, 'preload.js' )
			,	file
			}
		}
	)

	$.loadFile( 'index.html' )
	file && $.webContents.on(
		'did-finish-load'
	,	() => $.send( 'data', require( 'fs' ).readFileSync( file, 'utf8' ) )
	)

	$.webContents.openDevTools()
}


//app.commandLine.appendSwitch( 'js-flags', '--max-old-space-size=4096' )
app.whenReady().then(
	() => {

		createWindow()

		app.on(
			'activate'
		,	( event, hasVisibleWindows ) => hasVisibleWindows || createWindow()
		)
		app.on(
			'window-all-closed'
		,	() => isMac || app.quit()
		)

		const
		menu = Menu.buildFromTemplate(
			[	...isMac ? [ { role: 'appmenu' } ] : []
			,	{ role: 'filemenu'		}
			,	{ role: 'editmenu'		}
			,	{ role: 'viewmenu'		}
			,	{ role: 'windowmenu'	}
			,	{ role: 'help'			}
			,	{	label: 'Extra'
				,	submenu: []
				}
			]
		)

		const
		extraMenu = menu.items.find( $ => $.label === 'Extra' ).submenu
		extraMenu.insert( 0, new MenuItem( { label: 'ExtraMenuItem' } ) )

		const
		fileMenu = menu.items.find( $ => $.role === 'filemenu' ).submenu

		fileMenu.insert(
			0
		,	new MenuItem( 
				{	label		: 'Save as...'
				,	click		: ev => SendMenu( 'SaveAs' )
				}
			)
		)
		fileMenu.insert(
			0
		,	new MenuItem( 
				{	label		: 'Save'
				,	accelerator	: isMac ? 'Cmd+S' : 'Ctl+S'
				,	click		: ev => SendMenu( 'Save' )
				}
			)
		)
		fileMenu.insert( 0, new MenuItem( {	type: 'separator' } ) )
		fileMenu.insert(
			0
		,	new MenuItem( 
				{	label		: 'Open...'
				,	accelerator	: isMac ? 'Cmd+O' : 'Ctl+O'
				,	click		: ev => {
						const _ = dialog.showOpenDialogSync( { properties: [ 'openFile', 'openDirectory' ] } )
						_ && _.forEach( $ => createWindow( $ ) )
					}
				}
			)
		)
		fileMenu.insert(
			0
		,	new MenuItem( 
				{	label		: 'New'
				,	accelerator	: isMac ? 'Cmd+N' : 'Ctl+N'
				,	click		: ev => createWindow()
				}
			)
		)
		Menu.setApplicationMenu( menu )
	}
)

const
SaveAs = ( ev, $ ) => {
	const _ = dialog.showSaveDialogSync( { properties: [ 'openFile', 'openDirectory' ] } )
	_ && (
		require( 'fs' ).writeFileSync( _, $ )
	,	ev.sender.browserWindowOptions.webPreferences.file = _
	,	BrowserWindow.getFocusedWindow().title = _
	)
}
ipcMain.on(
	'saveAs'
,	( ev, $ ) => SaveAs( ev, $ )
)
ipcMain.on(
	'save'
,	( ev, $ ) => {
		const file = ev.sender.browserWindowOptions.webPreferences.file
		file
		?	require( 'fs' ).writeFileSync( file, $ )
		:	SaveAs( ev, $ )
	}
)

ipcMain.handle(
	'platform'
,	( ev, ...$ ) => process.platform
)

ipcMain.on(
	'clipboard'
,	( ev, $ ) => clipboard.writeText( $ )
)

ipcMain.handle(
	'clipboard'
,	ev => clipboard.readText()
)

ipcMain.handle(
	'messageBox'
,	( ev, ...$ ) => dialog.showMessageBoxSync( BrowserWindow.getFocusedWindow(), ...$ )
)

ipcMain.on(
	'errorBox'
,	( ev, ...$ ) => dialog.showErrorBox( ...$ )
)

