const
{ app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, clipboard } = require( 'electron' )

const
path = require( 'path' )

const
isMac = process.platform === 'darwin'
const
isWin = process.platform === 'win32'

const
createWindow = () => {

	const 
	$ = new BrowserWindow(
		{	width			: 1600
		,	height			: 800
		,	title			: 'untitled'
		,	webPreferences	: {
				preload		: path.join( __dirname, 'preload.js' )
			}
		}
	)
	$.loadFile( 'index.html' )
	$.webContents.openDevTools()
	$.webContents.on(
		'did-finish-load'
	,	() => $.send( 'platform', process.platform )
	)
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
		console.log(
			process.argv.slice(
				isWin
				?	process.argv[ 0 ].split( '\\' ).pop()	== 'electron.exe'	? 2 : 1
				:	process.argv[ 0 ].split( '/' ).pop()	== 'Electron'		? 2 : 1
			)
		)
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

/*
	Menu.setApplicationMenu( Menu.buildFromTemplate( Template() ) )
const
Template = () => [
	{ role	: 'appMenu' }
,	{ role	: 'fileMenu' }
,	{ role	: 'editMenu' }
,	{ role	: 'viewMenu' }
,	{ role	: 'windowMenu' }
,	{ role	: 'help' }
]
*/


