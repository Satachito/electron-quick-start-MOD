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
			}
		}
	)

	$.loadFile( 'index.html' )
	file && (
		$.on(
			'ready-to-show'
		,	() => $.send( 'data', require( 'fs' ).readFileSync( file, 'utf8' ) )
		)
	,	$.webContents.file = file
	)
	$.webContents.openDevTools()
}

const
SaveAs = ( ev, $ ) => {
	const _ = dialog.showSaveDialogSync( { properties: [ 'openFile', 'openDirectory' ] } )
	_ && (
		require( 'fs' ).writeFileSync( _, $ )
	,	ev.sender.file = _
	)
}
ipcMain.on( 'saveAs', SaveAs )
ipcMain.on(
	'save'
,	( ev, $ ) => {
		const file = ev.sender.file
		file
		?	require( 'fs' ).writeFileSync( file, $ )
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

