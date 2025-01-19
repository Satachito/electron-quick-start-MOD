const { contextBridge, ipcRenderer } = require( 'electron' )

contextBridge.exposeInMainWorld(
	'main', {

		process	: JSON.parse( JSON.stringify( process ) )

	,	onData	: _ => ipcRenderer.on( 'data', _ )
	,	onMenu	: _ => ipcRenderer.on( 'menu', _ )

	,	send	: ( channel, ...args ) => ipcRenderer.send( channel, ...args )
	,	invoke	: ( channel, ...args ) => ipcRenderer.invoke( channel, ...args )
	}
)

