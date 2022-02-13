const
{ app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, clipboard } = require( 'electron' )

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
		,	webPreferences	: {
				preload		: require( 'path' ).join( __dirname, 'preload.js' )
			}
		}
	)

	$.loadFile( 'index.html' )
	file && (
		$.webContents.on(
			'did-finish-load'
		,	() => $.send( 'data', require( 'fs' ).readFileSync( file, 'utf8' ), file )
		)
	,	$.webContents.file = file
	)
	$.webContents.openDevTools()

	$.webContents.on(
		'will-prevent-unload'
	,	ev => dialog.showMessageBoxSync(
			$
		,	{	type: 'question'
			,	buttons: [ 'Discard change and close', 'No' ]
			,	message: 'Do you really want to close this window?\nChanges you made may not be saved.'
			}
		) === 0 && ev.preventDefault()
	)
}

const
SaveAs = ( ev, $ ) => {
	const file = dialog.showSaveDialogSync(
		{	properties	: [ 'openFile', 'openDirectory' ]
		,	defaultPath	: ev.sender.file
		}
	)
	file && (
		require( 'fs' ).writeFileSync( file, $ )
	,	ev.sender.file = file
	)
	return file
}
ipcMain.handle( 'saveAs', SaveAs )
ipcMain.handle(
	'save'
,	( ev, $ ) => {
		const file = ev.sender.file
		return file
		?	(	require( 'fs' ).writeFileSync( file, $ )
			,	file
			)
		:	SaveAs( ev, $ )
	}
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

ipcMain.on(
	'sampleContextMenu'
,	( ev, ...$ ) => {
		var _ = new Menu()
		_.append( new MenuItem( { label: 'Delete', click: () => ev.sender.send( 'menu', 'Delete' ) } ) )
		_.append( new MenuItem( { type: 'separator' } ) )
		_.append( new MenuItem( { label: 'Edit', click: () => ev.sender.send( 'menu', 'Edit' ) } ) )
		return _.popup()
	}
)


const
isMac = process.platform === 'darwin'

//app.commandLine.appendSwitch( 'js-flags', '--max-old-space-size=4096' )
app.whenReady().then(
	() => {

		createWindow()

		app.on(
			'activate'
		,	( _, hasVisibleWindows ) => hasVisibleWindows || createWindow()
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
			,	{	label: 'SampleExtraMenu'
				,	submenu: []
				}
			]
		)

		const
		extraMenu = menu.items.find( $ => $.label === 'SampleExtraMenu' ).submenu
		extraMenu.insert( 0, new MenuItem( { label: 'SampleExtraMenuItem' } ) )

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
				,	accelerator	: 'CmdOrCtrl+S'
				,	click		: ev => SendMenu( 'Save' )
				}
			)
		)
		fileMenu.insert( 0, new MenuItem( {	type: 'separator' } ) )
		fileMenu.insert(
			0
		,	new MenuItem( 
				{	label		: 'Open...'
				,	accelerator	: 'CmdOrCtrl+O'
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
				,	accelerator	: 'CmdOrCtrl+N'
				,	click		: ev => createWindow()
				}
			)
		)
		Menu.setApplicationMenu( menu )
	}
)

