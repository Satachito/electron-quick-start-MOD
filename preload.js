const { contextBridge, ipcRenderer } = require( 'electron' )

//	PLATFORM

contextBridge.exposeInMainWorld(
	'onPlatform'
,	( ...$ ) => ipcRenderer.on( 'platform', ...$ )
)

//	MESSAGE BOX

contextBridge.exposeInMainWorld(
	'invokeMessageBox'
,	( ...$ ) => ipcRenderer.invoke( 'messageBox', ...$ )
)

//	ERROR BOX

contextBridge.exposeInMainWorld(
	'sendErrorBox'
,	( ...$ ) => ipcRenderer.send( 'errorBox', ...$ )
)

//	MENU

contextBridge.exposeInMainWorld(
	'onMenu'
,	( ...$ ) => ipcRenderer.on( 'menu', ...$ )
)

//	CLIPBOARD

contextBridge.exposeInMainWorld(
	'sendClipboard'
,	( ...$ ) => ipcRenderer.send( 'clipboard', ...$ )
)

contextBridge.exposeInMainWorld(
	'invokeClipboard'
,	( ...$ ) => ipcRenderer.invoke( 'clipboard', ...$ )
)

