const fs = require('fs');
const axios = require('axios');
const embedcreator = require('../embed.js');

async function downloadFile(url, name) {
	try {
		// ensure file is audio by checking mime type
		const typeresponse = await axios.head(url);
		const contentType = typeresponse.headers['content-type'];
		if (!contentType.includes('audio')) {
			embedcreator.sendError(name + ' is not an audio file');
			throw new Error('File is not an audio file');
		}
		// ensure the temp directory exists
		if (!fs.existsSync('./temp')) {
			fs.mkdirSync('./temp');
		}
		const outputPath = `./temp/${name}`;
		const response = await axios.get(url, { responseType: 'stream' });
		const writer = fs.createWriteStream(outputPath);

		response.data.pipe(writer);

		return new Promise((resolve, reject) => {
			writer.on('finish', () => resolve(outputPath));
			writer.on('error', reject);
		});
	}
	catch (error) {
		embedcreator.sendError(error);
		throw new Error(`Failed to download file: ${error.message}`);
	}
}
async function cleanupTempFiles() {
	// Remove all files in the temp directory asynchronously
	fs.readdir('./temp', (err, files) => {
		if (err) throw err;

		for (const file of files) {
			console.log(`Removing ${file}`);
			embedcreator.log(`Removing ${file}`);
			fs.unlinkSync(`./temp/${file}`, (err) => {
				if (err) throw err;
			});
			console.log(`${file} removed`);
			embedcreator.log(`${file} removed`);
		}
	},
	);
}
async function cleanupTrackFile(file) {
	// Remove the specified file from the temp directory
	console.log(`Removing ${file}`);
	embedcreator.sendError(`Removing ${file}`);
	fs.unlinkSync(`./temp/${file}`, (err) => {
		if (err) throw err;
	});
	console.log(`${file} removed`);
	embedcreator.log(`${file} removed`);
}

module.exports = { downloadFile, cleanupTempFiles, cleanupTrackFile };
