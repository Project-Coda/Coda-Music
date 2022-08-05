class Track {
	constructor(name, url, artist, artistImage, image, original_messageurl) {
		this.name = name;
		this.url = url;
		this.artist = artist;
		this.artistImage = artistImage;
		this.image = image;
		this.original_messageurl = original_messageurl;
	}
}
module.exports = { Track };