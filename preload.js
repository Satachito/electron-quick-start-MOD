const { contextBridge, ipcRenderer } = require( 'electron' )

//	PROCESS

contextBridge.exposeInMainWorld(
	'invokePlatform'
,	( ...$ ) => ipcRenderer.invoke( 'platform', ...$ )
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

//	APPLICATION

contextBridge.exposeInMainWorld(
	'onData'
,	( ...$ ) => ipcRenderer.on( 'data', ...$ )
)

contextBridge.exposeInMainWorld(
	'sendSave'
,	( ...$ ) => ipcRenderer.send( 'save', ...$ )
)

contextBridge.exposeInMainWorld(
	'sendSaveAs'
,	( ...$ ) => ipcRenderer.send( 'saveAs', ...$ )
)


