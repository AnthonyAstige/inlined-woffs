// TODO: Refactor all the things

/* global _, fontsData */

/**
 * Misc data
 */
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

// Misc helpers
// http://stackoverflow.com/a/7124052
function htmlEscape(str) {
	return str
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
}

/**
 * Generate
 */
function generateWoff(opts) {
	$.post(
		'https://ttf-to-woff-subset.gomix.me/base64',
		{
			ttfURL: opts.ttfURL,
			glyphs: opts.glyphs
		},
		(data) => {
			const fontName = 'Custom Subsetted Inlined Woff'
			let style = `\
<style>
@font-face {
  /* Font based on: ${opts.parentFontName} */
  font-family: '${fontName}';
  font-style: normal;
  font-weight: 400;
  src: url('${data}') format('woff');
}
*, body {
  /* Hack all elements same font & weight stop browser from funky extrapolations */
  font-family: '${fontName}';
  font-weight: 400 !important;
}
</style>`
			style = htmlEscape(style)
			$('#inlinedSubsetDialog pre').html(style)
			$('#inlinedSubsetDialog .js-parent-font-name').html(opts.parentFontName)
			$('#inlinedSubsetDialog .js-glyphs-count').html(opts.glyphs.length)
			$('#inlinedSubsetDialog').dialog({
				width: 500,
				maxHeight: 300
			})
		}
	)
}

$(document).ready(() => {
	/**
	 * Custom Subset
	 */
	function customSubset(event) {
		const glyphsSelected = sets
			.filter((set) => set.inc)
			.reduce((acc, set) => acc + set.glyphs.length, 0)
		const parentFontName = $(event.target).attr('data-font-name')
		const fp = $(event.target).attr('data-font-fp')
		let content = `<h2>\
				Choose glyphs from '${parentFontName}'\
				(<span class="glyphs-selected">${glyphsSelected}</span> glyphs selected)\
			</h2>\
			<button class="js-generate-the-subset">Generate Derivative Font</button>`
		content = sets.reduce((acc, set) => {
			const glyphs = set.glyphs.split('').reduce((ac, glyph) =>
				`${ac}<span data-glyph="${glyph}" class="tog${set.inc ? ' inc' : ''}">\
					${glyph}\
				</span> `, '')
			const ret = `${acc}\
				<div><h3 class="tog${set.inc ? ' inc' : ''}">${set.title}</h3>\
					${glyphs}\
				</div>`
			return ret
		}, content)

		$('#customSubsetsDialog .custom-subset-dialog').html(content)
		$('#customSubsetsDialog').dialog({
			width: 600,
			maxHeight: 400
		})

		$('.custom-subset-dialog .tog').click((ev) => {
			const target = $(ev.target)
			if (target.hasClass('inc')) {
				target.removeClass('inc')
			} else {
				target.addClass('inc')
			}
			if (target.is('h3')) {
				// Spogs = Span Toggles
				const spogs = target.closest('div').find('span.tog')
				spogs.removeClass('inc')
				if (target.hasClass('inc')) {
					spogs.addClass('inc')
				}
			}

			$('.custom-subset-dialog .glyphs-selected').html(
				$('.custom-subset-dialog span.tog.inc').length
			)
		})

		$('.js-generate-the-subset').click((ev) => {
			// TODO: Abstract this, re-use it as duped
			// Figure out TTF URL
			const origin = window.location.origin
			const ttfURL = `${origin}/fonts/${fp}.ttf`

			// Figure out glyphs to include
			const glyphs = $('.custom-subset-dialog span.tog.inc')
				.toArray()
				.reduce((acc, glyph) => acc + glyph.getAttribute('data-glyph'), '')

			// Generate that woff and do stuff with it
			generateWoff({ ttfURL, glyphs, parentFontName })
		})
	}

	/**
	 * DataTable
	 */
	function linksRender(data, type, row) {
		return '' +
			`<button class="js-generate-full-subset"\
				data-font-name="${row.name}"\
				data-font-fp="${row.fp}">\
				Full Subset\
			</button>\
			<button class="js-generate-customer-subset"
				data-font-name="${row.name}"\
				data-font-fp="${row.fp}">\
				Custom Subset\
			</button> `
	}
	function fontClass(rowData) {
		return `font-dynamic-inline-woff-${rowData.name}-${rowData.weightStyle}`
	}
	const loadedFonts = {}
	function loadFont(rowData) {
		const name = rowData.name
		const weightStyle = rowData.weightStyle
		if (loadedFonts[`${name}${weightStyle}`]) {
			return
		}
		$('head')
			.append(`<style>\
@font-face {
	font-family: 'Dynamic Inline Woff ${name} ${weightStyle}';
	font-style: normal;
	font-weight: 400;
	src: url(/fonts/${rowData.fp}.woff) format('woff');
}
.${fontClass(rowData)} {
	font-family: 'Dynamic Inline Woff ${name} ${weightStyle}';
	font-style: normal;
	font-weight: 400 !important;
}
\
</style>`)
		loadedFonts[`${name}${weightStyle}`] = true
	}

	function preview(data, type, rowData) {
		return `<span class="${fontClass(rowData)}">ABCDE abcde 01234 ~!@#$</span>`
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
		],
		rowCallback: (rowDom, rowData, index) => {
			loadFont(rowData)
		}
	})

	/**
	 * Connect DataTable to Custom Subset generaiton
	 */
	$('.js-generate-customer-subset').click(customSubset)
	table.on('draw', () => {
		$('.js-generate-customer-subset').click(customSubset)
	})

	/**
	 * Generate
	 */
	$('.js-generate-full-subset').click((ev) => {
		// Figure out parent font name
		const parentFontName = $(ev.target).attr('data-font-name')
		// Figure out TTF URL
		const fp = $(ev.target).attr('data-font-fp')
		const origin = window.location.origin
		const ttfURL = `${origin}/fonts/${fp}.ttf`
		generateWoff({
			parentFontName,
			ttfURL,
			glyphs: sets.reduce((acc, set) => acc + set.glyphs, '')
		})
	})
})
