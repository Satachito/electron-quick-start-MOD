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

let
prevData = TextArea.value

onData(
	( _, $, file ) => (
		prevData = $
	,	TextArea.value = $
	,	document.title = file
	)
)

onMenu(
	async ( _, $ ) => {
		console.log( $ )

		const
		_Save = async _ => {
			const $ = await ipcRenderer.invoke( _, TextArea.value )
			$ 
			?	(	originalData = TextArea.value
				,	document.title = $
				)
			:	console.log( 'Save canceled' )
		}

		switch ( $ ) {
		case 'Save':
			_Save( 'save' )
			break
		case 'SaveAs':
			_Save( 'saveAs' )
			break
		}
	}
)

onbeforeunload = ev => TextArea.value != prevData
?	(	ev.preventDefault()
	,	ev.returnValue = ''	// for Chrome/Electron
	,	console.log( 'DIRTY' )
	)
:	undefined

