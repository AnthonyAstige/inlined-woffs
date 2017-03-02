/* global _, fontsData */
$(document).ready(() => {
	function linksRender(data, type, row) {
		return `<button ref="${row.name}">Generate</button>`
	}
	function preview(data, type, row) {
		return 'ABCDE abcde'
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
			{ title: 'Full Size [KB]', data: 'size', render: kb },
			{ title: 'Preview', render: preview },
			{ title: 'Links', render: linksRender, sortable: false }
		]
	})
})
