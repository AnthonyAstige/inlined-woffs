$(document).ready(() => {
	function linksRender(data, type, row) {
		return `<a target="_blank" href="https://fonts.google.com/?query=${row.name}">Google Font</a>`
	}
	$('#myTable').DataTable({
		data: _.map(fontsData, (dat) => {
			dat.size /= 1024
			return dat
		}),
		order: [
			[2, 'asc']
		],
		columns: [
			{ title: 'Font name', data: 'name' },
			{ title: 'Weight/Style', data: 'weightStyle', defaultContent: '' },
			{ title: 'Size [KB]', data: 'size', render: (size) => Math.round(size * 10) / 10 },
			{ title: 'Links', render: linksRender, sortable: false }
		]
	})
})
