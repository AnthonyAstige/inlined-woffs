/* global _, fontsData */
$(document).ready(() => {
	function linksRender(data, type, row) {
		return `<a target="_blank" href="https://fonts.google.com/?query=${row.name}">Search Google Fonts for parent</a> |`
	}
	function kb(size) {
		return Math.round(size * 10) / 10
	}
	$('#myTable').DataTable({ // eslint-disable-line new-cap
		data: _.map(fontsData, (dat) => {
			dat.size /= 1024
			return dat
		}),
		order: [
			[2, 'asc']
		],
		columns: [
			{ title: 'Derive from font', data: 'name' },
			{ title: 'Weight/Style', data: 'weightStyle', defaultContent: '' },
			{ title: 'A-Z Size [KB]', data: 'size', render: kb },
			{ title: 'Full Size [KB]', data: 'size', render: kb }
		]
	})
})
