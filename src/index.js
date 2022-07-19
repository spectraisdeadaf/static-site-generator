import fs from 'fs'
import glob from 'glob'
import matter from 'gray-matter'
import { marked } from 'marked'
import mkdirp from 'mkdirp'
import path from 'path'

const readFile = (filename) => {
	const rawFile = fs.readFileSync(filename, 'utf8')
	const parsed = matter(rawFile)
	const html = marked(parsed.content)

	return { ...parsed, html }
}

const formatter = (template, { date, title, content, author }) =>
	template
		.replace(/<!-- PUBLISH_DATE -->/g, date)
		.replace(/<!-- TITLE -->/g, title)
		.replace(/<!-- AUTHOR -->/g, author)
		.replace(/<!-- CONTENT -->/g, content)

const saveFile = (filename, contents) => {
	const dir = path.dirname(filename)
	mkdirp.sync(dir)
	fs.writeFileSync(filename, contents)
}

const getOutputFilename = (filename, outPath) => {
	const basename = path.basename(filename)
	const newfilename = basename.substring(0, basename.length - 3) + '.html'
	const outfile = path.join(outPath, newfilename)
	return outfile
}

const processFile = (filename, template, outPath) => {
	const file = readFile(filename)
	const outfilename = getOutputFilename(filename, outPath)

	const formatted = formatter(template, {
		date: file.data.date,
		title: file.data.title,
      author: file.data.author,
		content: file.html,
	})

	saveFile(outfilename, formatted)
	//console.log(`${outfilename}`)
}

const main = () => {
	const outPath = path.resolve('output')
	const template = fs.readFileSync(path.resolve('template/template.html'), 'utf8')
	const filenames = glob.sync(path.resolve('pages/**/*.md'))

	filenames.forEach((filename) => {
		processFile(filename, template, outPath)
	})
}

main()