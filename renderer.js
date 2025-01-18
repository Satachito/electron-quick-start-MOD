console.log( main.process )

MessageBoxB.onclick = async () => {
	const $ = await main.invoke(
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
,	main.send( 'errorBox', ErrorBoxTitle.value, SomeText.value )
)

AlertB.onclick = () => console.log( 'Alert:', alert( SomeText.value ) )

ConfirmB.onclick = () => console.log( 'Confirm:', confirm( SomeText.value ) )

SendClipboardB.onclick = () => {
	main.send( 'clipboard', ClipboardText.value )
}

InvokeClipboardB.onclick = async () => {
	ClipboardText.value = await main.invoke( 'clipboard' )
}

TextArea.oncontextmenu = () => main.send( 'sampleContextMenu' )

let
prevData = TextArea.value

main.onData(
	( _, $, file ) => (
		prevData = $
	,	TextArea.value = $
	,	document.title = file
	)
)

main.onMenu(
	( _, $ ) => {

		const
		_Save = _ => main.invoke( _, TextArea.value ).then(
			file => file && (
				prevData = TextArea.value
			,	document.title = file
			)
		)

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

onbeforeunload = ev => TextArea.value != prevData && (
		ev.preventDefault()		//	Backward compatibility
	,	ev.returnValue = ''		//	for Chrome/Electron
)


