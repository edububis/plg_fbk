document.addEventListener('DOMContentLoaded', async function() {
  	var closeButton = document.getElementById('acceptButton');
	const tab = await chrome.tabs.query({active: true, lastFocusedWindow: true});
	closeButton.addEventListener('click', async function()  {
		const response = await chrome.runtime.sendMessage({ action: 'start', message:tab[0]} );
		console.log(response);
		window.close();
	});
});