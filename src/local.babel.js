$(document).ready(() => {
	console.log(fontsData)
	$('#myTable').DataTable( {
		data: fontsData,
		columns: [
		        { data: 'name' },
		        { data: 'size' }
		    ]
	} );
})
