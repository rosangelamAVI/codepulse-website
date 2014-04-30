var handlebars = require('handlebars'),
	fs = require('fs'),
	rmrf = require('rimraf'),
	mkdirp = require('mkdirp'),
	ncp = require('ncp').ncp,
	path = require('path'),
	templateManifest = require('./templates/manifest'),
	baseTemplatePath = './templates',
	baseDistPath = './dist',
	templates = {},
	faqData = require('./data/faqs')

// generate handlebars templates from the templateManifest,
// and register each one as partials
;(function(){
	var key, relPath, templatePath, source

	for(key in templateManifest){
		relPath = templateManifest[key]
		templatePath = path.join(baseTemplatePath, relPath)
		source = fs.readFileSync(templatePath, 'utf-8')
		templates[key] = handlebars.compile(source)
		handlebars.registerPartial(key, templates[key])
	}
})()

// Enable {{#wrap with='templateKey'}} in templates.
// The wrapper must embed {{{__wrapped_content}}} for this to work.
handlebars.registerHelper('wrap', function(options){

	// render the wrapped template first..
	var wrappedContent = options.fn(this)
	var wrapperTemplate = templates[options.hash['with']]

	// ...then call the wrapper, using the wrapped template's
	// output as the input to __wrapped_content
	var data = options.data.root
	data['__wrapped_content'] = wrappedContent
	return wrapperTemplate(data)
})

// clean the 'dist' directory
rmrf.sync(baseDistPath)
mkdirp.sync(baseDistPath)

// runs a template function to generate an output file
function generateTemplateOutput(templateName, outputRelPath, templateData){
	templateData = templateData || {}
	var output = templates[templateName](templateData),
		outputPath = path.join(baseDistPath, outputRelPath)
	fs.writeFileSync(outputPath, output, 'utf-8')
}

// generate dist/index.html
generateTemplateOutput('index', 'index.html', {
	navLinks: require('./data/index-navigation'),
	includes: [
		{css: "deps/carousel.css"},
		{css: "deps/features.css"},
		{css: "deps/why.css"},
		{css: 'deps/how.css'},
		{js:  'deps/how.js'}
	]
})

// generate dist/faq.html
generateTemplateOutput('faq', 'faq.html', {
	faqs: faqData,
	includes: [
		{js: 'deps/faq.js'}
	]
})

// generate dist/deps/* by copying the static-deps folder (async!)
ncp('./static-deps', path.join(baseDistPath, '/deps'), function(err, result){
	// blank callback function for now...
})
