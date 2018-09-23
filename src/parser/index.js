const config = require('config');
const osmosis = require('osmosis');

const url = config.get('parser.hostname.url');
const mens_fashion = config.get('parser.categories.mens_fashion');


osmosis
	.get(url + mens_fashion)
	.find('[data-test-pingrid] > div > div > div') ////div[@data-grid-item="true"]
	.set({
		'title': 'h3',
		'description': 'data-test-desc',
		'images': ['img@src']
	})
	.data((item) => {
		console.log('item', item);
	}).done(() => {
		console.log('done');
	})
	.log(console.log)
	.error(console.error);


/*
osmosis
	.get('https://www.google.co.in/search?q=analytics')
	.find('#botstuff')
	.set({'related': ['.card-section .brs_col p a']})
	.data((data)=> {
		console.log(data);
	});*/

/*
osmosis
	.get('www.craigslist.org/about/sites')
	.find('h1 + div a')
	.set('location')
	.follow('@href')
	.find('header + div + div li > a')
	.set('category')
	.follow('@href')
	.paginate('.totallink + a.button.next:first')
	.find('p > a')
	.follow('@href')
	.set({
		'title':        'section > h2',
		'description':  '#postingbody',
		'subcategory':  'div.breadbox > span[4]',
		'date':         'time@datetime',
		'latitude':     '#map@data-latitude',
		'longitude':    '#map@data-longitude',
		'images':       ['img@src']
	})
	.data(function(listing) {
		// do something with listing data
	})
	.log(console.log)
	.error(console.log)
	.debug(console.log)*/
