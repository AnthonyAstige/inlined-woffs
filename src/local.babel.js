$(document).ready(() => {
	$('#myTable').DataTable({
		data: _.map(fontsData, (dat) => {
			dat.size /= 1024
			return dat
		}),
		columns: [
			{ title: 'Font name', data: 'name' },
			{ title: 'Weight/Style', data: 'weightStyle' },
			{ title: 'Size [KB]', data: 'size' }
		]
	})
})
