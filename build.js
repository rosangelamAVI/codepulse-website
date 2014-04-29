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
	key, 
	relPath, 
	templatePath, 
	source

// generate handlebars templates from the templateManifest,
// and register each one as partials
for(key in templateManifest){
	relPath = templateManifest[key]
	templatePath = path.join(baseTemplatePath, relPath)
	source = fs.readFileSync(templatePath, 'utf-8')
	templates[key] = handlebars.compile(source)
	handlebars.registerPartial(key, templates[key])
}

rmrf.sync(baseDistPath)
mkdirp.sync(baseDistPath)

// generate dist/index.html
var indexSource = templates['index'](),
	indexPath = path.join(baseDistPath, 'index.html')
fs.writeFileSync(indexPath, indexSource, 'utf-8')

function copyFile(basePath, newPath, file){
	var oldPath = path.join(basePath, file),
		newPath = path.join(newPath, file)
}

// copy static dependencies into dist
ncp('./static-deps', path.join(baseDistPath, '/deps'))