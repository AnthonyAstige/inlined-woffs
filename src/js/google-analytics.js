function sendToGA() {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-89140206-2', 'auto');
  ga('send', 'pageview');
}

function sendToGAIfOkay() {
	if ('disable_ga=true' === window.location.href.split('?')[1]) {
		alert('Disabling GA from this device for 10 years via cookie')
		Cookies.set('GADisabled', 10 * 365)
	}

	if (Cookies.get('GADisabled')) {
		console.log('Not sending to GA: GADisabled cookie found')
		return
	}

	if (-1 === window.location.hostname.search('inlined-woffs.zinid.com')) {
		console.log('Not sending to GA: Host name not matched')
		return
	}

	console.log('Sending GA...')
	sendToGA()
}

sendToGAIfOkay()
