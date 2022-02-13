const { contextBridge, ipcRenderer } = require( 'electron' )

contextBridge.exposeInMainWorld(
	'ipcRenderer'
,	ipcRenderer
)

contextBridge.exposeInMainWorld(
	'onData'
,   $ => ipcRenderer.on( 'data', $ )
)

contextBridge.exposeInMainWorld(
	'onMenu'
,   $ => ipcRenderer.on( 'menu', $ )
)

contextBridge.exposeInMainWorld(
	'process'
,	JSON.parse( JSON.stringify( process ) )
)

