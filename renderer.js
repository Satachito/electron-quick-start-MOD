const
Log = $ => Footer.textContent = $

MessageBoxB.onclick = () => (
	Log( 'MessageBox:' )
,	window.invokeMessageBox(
		{	type:		MessageBoxType.value
		,	message:	MessageBoxText.value
		,	buttons:	JSON.parse( MessageBoxButtons.value )
		}
	).then( $ => Log( 'MessageBox: Button #' + $ + ' is Clicked' ) )
)

ErrorBoxB.onclick = () => (
	Log( 'ErrorBox:' )
,	window.sendErrorBox( ErrorBoxTitle.value, ErrorBoxText.value )
)

AlertB.onclick = () => (
	Log( 'Alert:' )
,	window.alert( AlertText.value )
)

SendClipboardB.onclick = () => {
	window.sendClipboard( ClipboardText.value )
}

InvokeClipboardB.onclick = async () => {
	ClipboardText.value = await window.invokeClipboard()
}

window.onPlatform( ( _, $ ) => Log( 'Platform:' + $ ) )
