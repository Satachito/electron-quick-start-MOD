console.log( process )

MessageBoxB.onclick = async () => {
	const $ = await ipcRenderer.invoke(
		'messageBox'
	,	{	type:		MessageBoxType.value
		,	message:	SomeText.value
		,	buttons:	JSON.parse( MessageBoxButtons.value )
		}
	)
	console.log( 'MessageBox: Button #' + $ + ' is Clicked' )
}

ErrorBoxB.onclick = () => (
	console.log( 'ErrorBox:' )
,	ipcRenderer.send( 'errorBox', ErrorBoxTitle.value, SomeText.value )
)

AlertB.onclick = () => console.log( 'Alert:', alert( SomeText.value ) )

ConfirmB.onclick = () => console.log( 'Confirm:', confirm( SomeText.value ) )

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
	( _, $ ) => {

		const
		_Save = async _ => {
			const file = await ipcRenderer.invoke( _, TextArea.value )
			file && (
				prevData = TextArea.value
			,	document.title = file
			)
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
?	ev.returnValue = ''	// for Chrome/Electron
:	undefined

