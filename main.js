const
{ app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, clipboard, session } = require( 'electron' )
const fs = require( 'fs' )
const path = require( 'path' )

const
Send = ( ..._ ) => {
	const $ = BrowserWindow.getFocusedWindow()
	$ && $.webContents.send( ..._ )
}

const
SendMenu = ( ..._ ) => Send( 'menu', ..._ )

const
Message = ( ..._ ) => dialog.showMessageBoxSync( BrowserWindow.getFocusedWindow(), ..._ )

const
Error = ( ..._ ) => dialog.showErrorBox( ..._ )


const
CreateWindow = _ => {

	const 
	$ = new BrowserWindow(
		{	width			: 1600
		,	height			: 800
		,	webPreferences	: {
				preload				: path.join( __dirname, 'preload.js' )
			,	contextIsolation	: true
			,	nodeIntegration		: false
			}
		}
	)

	$.loadFile( 'index.html' )
	_ && (
		$.webContents.on(
			'did-finish-load'
		,	() => $.webContents.send( 'data', fs.readFileSync( _, 'utf8' ), _ )
		)
	,	$.webContents.file = _
	)

	$.webContents.openDevTools()

	$.webContents.on(
		'will-prevent-unload'
	,	ev => Message(
			{	type: 'question'
			,	buttons: [ 'Save', `Don't save`, 'Cancel' ]
			,	message: `Do you want to save the changes you made?`
			,	title: `Your changes will be lost if you don't save them.`
			}
		) === 0 && ev.preventDefault()
	)

	session.defaultSession.loadExtension(
		path.join( __dirname, 'metamask-extension', 'dist', 'chrome' )
	).then( console.log ).catch( console.error )
	
}

const
Open = () => {
	const $ = dialog.showOpenDialogSync( { properties: [ 'openFile', 'openDirectory' ] } )
	$ && $.forEach( _ => CreateWindow( _ ) )
}

const
SaveAs = ( ev, _ ) => {
	const $ = dialog.showSaveDialogSync(
		{ defaultPath: ev.sender.file }
	)
	$ && (
		fs.writeFileSync( $, _ )
	,	ev.sender.file = $
	)
	return $
}
ipcMain.handle( 'saveAs', SaveAs )
ipcMain.handle(
	'save'
,	( ev, _ ) => {
		const file = ev.sender.file
		return file
		?	(	fs.writeFileSync( file, _ )
			,	file
			)
		:	SaveAs( ev, _ )
	}
)

ipcMain.on(
	'clipboard'
,	( ev, _ ) => clipboard.writeText( _ )
)

ipcMain.handle(
	'clipboard'
,	ev => clipboard.readText()
)

ipcMain.handle(
	'messageBox'
,	( ev, ..._ ) => Message( ..._ )
)

ipcMain.on(
	'errorBox'
,	( ev, ..._ ) => Error( ..._ )
)

/*
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
*/

const
isMac = process.platform === 'darwin'

app.on(
	'window-all-closed'
,	() => isMac || app.quit()
)

//v	macOS specific
//	TODO: ChatGPT は　BrowserWindow.getAllWindows().length === 0
app.on(
	'activate'
,	( _, hasVisibleWindows ) => hasVisibleWindows || CreateWindow()
)
app.on(
	'open-file'
,	( ev, _ ) => (
		ev.preventDefault()
	,	CreateWindow( _ )
	)
)
//^	macOS specific


//app.commandLine.appendSwitch( 'js-flags', '--max-old-space-size=4096' )
app.whenReady().then(
	() => {

		const
		menu = Menu.buildFromTemplate(
			[	...isMac ? [ { role: 'appmenu' } ] : []
			,	{ role: 'filemenu'		}
			,	{ role: 'editmenu'		}
			,	{ role: 'viewmenu'		}
			,	{ role: 'windowmenu'	}
			,	{	label: 'SampleExtraMenu'
				,	submenu: [
						{	label		: 'x1.1'
						,	accelerator : 'CmdOrCtrl+;'
						,	click		: () => SendMenu( 'x1.1' )
						}
					,	{	label		: 'x2.0'
						,	accelerator : 'Shift+CmdOrCtrl+;'
						,	click		: () => SendMenu( 'x2.0' )
						}
					]
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
				,	click		: Open
				}
			)
		)
		fileMenu.insert(
			0
		,	new MenuItem( 
				{	label		: 'New'
				,	accelerator	: 'CmdOrCtrl+N'
				,	click		: ev => CreateWindow()
				}
			)
		)
		Menu.setApplicationMenu( menu )

//dialog.showErrorBox( 'ARGV', JSON.stringify( process.argv ) )

		const $ = process.argv.slice( process.defaultApp ? 2 : 1 )
		$.length
		?	$.forEach( _ => CreateWindow( _ ) )
		:	Message(
				{	message	: 'electron-quick-start-MOD'
				,	buttons	: [ 'Create New', 'Open Dialog' ]
				}
			)
			?	Open()
			:	CreateWindow()
		;
	}
)

