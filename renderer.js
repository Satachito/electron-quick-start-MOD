console.log( main.process )

AlertB.onclick				= () => alert( SomeText.value )

ConfirmB.onclick			= () => confirm( SomeText.value )

MessageBoxB.onclick			= async () => console.log(
	await main.invoke(
		'messageBox'
	,	{	type:		MessageBoxType.value
		,	message:	SomeText.value
		,	buttons:	JSON.parse( MessageBoxButtons.value )
		}
	)
)

ErrorBoxB.onclick			= () => main.send( 'errorBox', ErrorBoxTitle.value, SomeText.value )

SendClipboardB.onclick		= () => main.send( 'clipboard', ClipboardText.value )

InvokeClipboardB.onclick	= async () => ClipboardText.value = await main.invoke( 'clipboard' )

let
snapshot = TextArea.value

main.onData(
	( _, $, file ) => (
		snapshot = $
	,	TextArea.value = $
	,	document.title = file
	)
)

TextArea.oncontextmenu		= () => main.send( 'sampleContextMenu' )

TextArea.oninput			= () => main.send( 'status', { isDirty: TextArea.value !== snapshot } )

main.onMenu(
	( _, $ ) => {

console.log( 'onMenu', $ )

		const
		_Save = _ => main.invoke( _, TextArea.value ).then(
			file => file && (
				snapshot = TextArea.value
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


onbeforeunload = ev => ev.preventDefault()
