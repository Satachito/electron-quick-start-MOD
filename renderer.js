console.log( process )

MessageBoxB.onclick = async () => {
	const $ = await ipcRenderer.invoke(
		'messageBox'
	,	{	type:		MessageBoxType.value
		,	message:	MessageBoxText.value
		,	buttons:	JSON.parse( MessageBoxButtons.value )
		}
	)
	console.log( 'MessageBox: Button #' + $ + ' is Clicked' )
}

ErrorBoxB.onclick = () => (
	console.log( 'ErrorBox:' )
,	ipcRenderer.send( 'errorBox', ErrorBoxTitle.value, ErrorBoxText.value )
)

AlertB.onclick = () => (
	console.log( 'Alert:' )
,	alert( AlertText.value )
)

SendClipboardB.onclick = () => {
	ipcRenderer.send( 'clipboard', ClipboardText.value )
}

InvokeClipboardB.onclick = async () => {
	ClipboardText.value = await ipcRenderer.invoke( 'clipboard' )
}

TextArea.oncontextmenu = () => ipcRenderer.send( 'sampleContextMenu' )

onData( ( _, $ ) => TextArea.value = $ )

onMenu(
	( _, $ ) => {
		console.log( $ )
		switch ( $ ) {
		case 'Save':
			ipcRenderer.send( 'save', TextArea.value )
			break
		case 'SaveAs':
			ipcRenderer.send( 'saveAs', TextArea.value )
			break
		}
	}
)

