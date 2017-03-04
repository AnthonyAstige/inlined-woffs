// TODO: Refactor all the things

/* global _, fontsData */

/**
 * Misc helpers
 */
// Don't make too long of font-family names of IE won't like it
// * http://stackoverflow.com/a/21535758
// Don't make font name a derivative of original (OFL requirement)
function fontFamily() {
	return (0 | Math.random() * 9e6).toString(36) // eslint-disable-line no-bitwise
}
function fontClass(rowData) {
	return `font-dynamic-inline-woff-${rowData.name}-${rowData.weightStyle}`
}

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
			// TODO: Add in weightStyle to this
			const fontFam = fontFamily(opts.parentFontName)
			let style = `\
<style>
@font-face {
  /* Font based on: ${opts.parentFontName} (Weight/Style: ${opts.parentFontWeightStyle})*/
  font-family: '${fontFam}';
  font-style: normal;
  font-weight: 400;
  src: url('${data}') format('woff');
}
*, body {
  /* Hack all elements same font & weight stop browser from funky extrapolations */
  font-family: '${fontFam}';
  font-weight: 400 !important;
}
</style>`
			style = htmlEscape(style)
			$('#inlinedSubsetDialog pre').html(style)
			$('#inlinedSubsetDialog .js-parent-font-name').html(
				opts.parentFontName.toUpperCase()
			)
			$('#inlinedSubsetDialog .js-glyphs-count').html(opts.glyphs.length)
			$('#inlinedSubsetDialog .js-byte-size').html(
				Math.round(10 * data.length / 1024) / 10
			)
			$('#inlinedSubsetDialog').dialog({
				width: 500,
				maxHeight: 300
			})
			$(opts.reEnable)
				.text(opts.reEnableText)
				.prop('disabled', false)
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
		const parentFontWeightStyle = $(event.target).attr('data-font-weightStyle')
		const fontCls = fontClass({
			name: $(event.target).attr('data-font-name'),
			weightStyle: $(event.target).attr('data-font-weightStyle')
		})
		const fp = $(event.target).attr('data-font-fp')
		let content = `<h2>CHOOSE GLYPHS FROM ${parentFontName.toUpperCase()}</h2>\
			<span class="glyphs-selected">${glyphsSelected}</span> GLYPHS SELECTED<br />\
			<br />\
			<button class="js-generate-the-subset">Generate Derivative Font</button>`
		content = sets.reduce((acc, set) => {
			const glyphs = set.glyphs.split('').reduce((ac, glyph) =>
				`${ac}<span data-glyph="${glyph}" class="tog${set.inc ? ' inc' : ''}\
					${fontCls}">\
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
			$(ev.target)
				.text('Loading...')
				.prop('disabled', true)

			// TODO: Abstract this, re-use it as duped
			// Figure out TTF URL
			const origin = window.location.origin
			const ttfURL = `${origin}/fonts/${fp}.ttf`

			// Figure out glyphs to include
			const glyphs = $('.custom-subset-dialog span.tog.inc')
				.toArray()
				.reduce((acc, glyph) => acc + glyph.getAttribute('data-glyph'), '')

			// Generate that woff and do stuff with it
			generateWoff({
				ttfURL,
				glyphs,
				parentFontName,
				parentFontWeightStyle,
				reEnable: $(ev.target),
				reEnableText: 'Generate Derivative Font'
			})
		})
	}

	/**
	 * DataTable
	 */
	function linksRender(data, type, row) {
		return '' +
			`<button class="js-generate-full-subset"\
				data-font-name="${row.name}"\
				data-font-weightStyle="${row.weightStyle}"\
				data-font-fp="${row.fp}">\
				Full Subset\
			</button>\
			<button class="js-generate-customer-subset"
				data-font-name="${row.name}"\
				data-font-weightStyle="${row.weightStyle}"\
				data-font-fp="${row.fp}">\
				Custom Subset\
			</button> `
	}
	const loadedFonts = {}
	function loadFont(rowData) {
		const name = rowData.name
		const weightStyle = rowData.weightStyle
		if (loadedFonts[`${name}${weightStyle}`]) {
			return
		}
		const fontFam = fontFamily(`${name} ${weightStyle}`)
		$('head')
			.append(`<style>\
@font-face {
	font-family: '${fontFam}';
	font-style: normal;
	font-weight: 400;
	src: url(/fonts/${rowData.fp}.woff) format('woff');
}
.${fontClass(rowData)} {
	font-family: '${fontFam}';
	font-style: normal;
	font-weight: 400 !important;
}
\
</style>`)
		loadedFonts[`${name}${weightStyle}`] = true
	}

	function preview(data, type, rowData) {
		return `<span class="${fontClass(rowData)}">ABC abc 012 ~!@</span>`
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
			{ title: 'Gzip size of full subset [KB]', data: 'size', render: kb },
			{ title: 'Preview', render: preview },
			{ title: 'Generate inlined woff', render: linksRender, sortable: false }
		],
		rowCallback: (rowDom, rowData, index) => {
			loadFont(rowData)

			/**
			 * Connect DataTable to Custom Subset generaiton
			 */
			$(rowDom).find('.js-generate-customer-subset')
				.click(customSubset)

			/**
			 * Generate
			 */
			$(rowDom).find('.js-generate-full-subset')
				.click((ev) => {
					$(ev.target)
						.text('Loading...')
						.prop('disabled', true)
					// Figure out parent font name
					const parentFontName = $(ev.target).attr('data-font-name')
					const parentFontWeightStyle = $(ev.target)
						.attr('data-font-weightStyle')
					// Figure out TTF URL
					const fp = $(ev.target).attr('data-font-fp')
					const origin = window.location.origin
					const ttfURL = `${origin}/fonts/${fp}.ttf`
					generateWoff({
						parentFontName,
						parentFontWeightStyle,
						ttfURL,
						glyphs: sets.reduce((acc, set) => acc + set.glyphs, ''),
						reEnable: $(ev.target),
						reEnableText: 'Full Subset'
					})
				}
			)
		}
	})
})
