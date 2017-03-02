/* global _, fontsData */
$(document).ready(() => {
	/**
	 * Custom Subset
	 */
	function customSubset(event) {
		const sets = [
			{
				title: 'A through Z (uppercase)',
				glyphs: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
				inc: true
			},
			{
				title: '" " (space)',
				glyphs: ' ',
				inc: true
			},
			{
				title: 'a through z (lowercase)',
				glyphs: 'abcdefghijklmnopqrstuvwxyz'
			},
			{
				title: '0-9 (numbers)',
				glyphs: '0123456789'
			},
			{
				title: 'Special characters',
				glyphs: '~`!@#$%^&*()-_=+{}[]\\|;:\'"<,>./?'
			}
		]

		const glyphsSelected = sets
			.filter((set) => set.inc)
			.reduce((acc, set) => acc + set.glyphs.length, 0)
		const fontName = 'abba'
		let content = `<h2>\
				Generate custom subset of ${fontName}\
				(<span class="glyphs-selected">${glyphsSelected}</span> glyphs selected\
			</h2>\
			<button>Generate</button>`
		content = sets.reduce((acc, set) => {
			const glyphs = set.glyphs.split('').reduce((ac, glyph) =>
				`${ac}<span class="tog${set.inc ? ' inc' : ''}">${glyph}</span> `, '')
			return `<div>\
					${acc} <h3 class="tog${set.inc ? ' inc' : ''}">${set.title}</h3>\
					${glyphs}\
				</div>`
		}, content)

		$('#customSubsetsDialog .custom-subset-dialog')
			.html(content)
		$('#customSubsetsDialog')
			.show()

		$('.custom-subset-dialog .tog').click((ev) => {
			const target = ev.target
			if ($(target).hasClass('inc')) {
				$(target).removeClass('inc')
			} else {
				$(target).addClass('inc')
			}
			$('.custom-subset-dialog .glyphs-selected').html(
				$('.custom-subset-dialog span.tog.inc').length
			)
		})
	}

	/**
	 * DataTable
	 */
	function linksRender(data, type, row) {
		return '' +
			`<button class="js-generate-full-subset" ref="${row.name}">\
				Full Subset\
			</button>\
			<button class="js-generate-customer-subset" ref="${row.name}">\
				Custom Subset\
			</button> `
	}
	function preview(data, type, row) {
		return 'ABCDE abcde'
	}
	function kb(size) {
		return Math.round(size * 10) / 10
	}
	const table = $('#myTable').DataTable({ // eslint-disable-line new-cap
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
			{ title: 'Full Subset Size [KB]', data: 'size', render: kb },
			{ title: 'Preview', render: preview },
			{ title: 'Generate inlined font', render: linksRender, sortable: false }
		]
	})

	/**
	 * Connect DataTable to Custom Subset generaiton
	 */
	$('.js-generate-customer-subset').click(customSubset)
	table.on('draw', () => {
		$('.js-generate-customer-subset').click(customSubset)
	})
})
