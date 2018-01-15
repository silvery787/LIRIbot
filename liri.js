const MAXsongs = 7;
const LOGfilename = 'log.txt';

const keys = require('./keys.js');
const request = require('request');
const fs = require('fs');

const arg_arr = process.argv;
const command = arg_arr[2];

logFileOnly("*** "+arg_arr.slice(2).join(' '));

switch(command){

	case 'my-tweets':
		var num = parseInt(arg_arr.slice(3)) || 20;
		getTwits(num);
		break;

	case 'spotify-this-song':
		var songName = arg_arr.slice(3).join(' ') || 'The Sign Ace of Base';
		spotifySong(songName);
		break;

	case 'movie-this':
		var movieName = arg_arr.slice(3).join('+') || "Mr.+Nobody";
		getMovie(movieName); 
		break;

	case 'do-what-it-says':
		commandFromFile('random.txt');
		break;

	default: 
		console.log("Unknown command!\nUse Cases: my-tweets/spotify-this-song/movie-this/do-what-it-says");	
		console.log('------------------------------------');
}

function getMovie(name){

	var queryUrl = "http://www.omdbapi.com/?t=" + name + "&y=&plot=short&apikey=trilogy";

	request(queryUrl, function(error, response, body) {
		if (!error && response.statusCode === 200) {

			log("=====  "+JSON.parse(body).Title+"  =====");
			log("Released: "+ JSON.parse(body).Year);
			log("IMDB Rating: "+ JSON.parse(body).imdbRating);
			log("Rotten Tomatoes Rating: "+ JSON.parse(body).Ratings[1].Value);
			log("Country: "+ JSON.parse(body).Country);
			log("Language: "+ JSON.parse(body).Language);
			log("Plot: "+ JSON.parse(body).Plot);
			log("Actors: "+ JSON.parse(body).Actors);
			log('-------------------------------------');

		}
		else if(error){
			log("OMDBapi ERROR: " + error);
		}
	});
}

function getTwits(num){

	var Twitter = require('twitter');
 
	var client = new Twitter( keys.twitterKeys );
	 
	var params = {screen_name: 'nodejs'};
	client.get('statuses/user_timeline', { screen_name: 'silvery_bc', count: num }, function(error, tweets, response) {
	    if (!error) {

	    	log('----------------------------');
	    	for(var i=0; i<tweets.length; i++){
	    		log( (i+1) + ". " + tweets[i].text );
	    		log('----------------------------');
	    	}
	    }
	    else {
	    	log("Twitter error: " + error);
	    }
	});
}

function spotifySong(name){

	var Spotify = require('node-spotify-api');
 
	var spotify = new Spotify( keys.spotifyKeys );
 
	spotify.search({ type: 'track', query: name }, function(err, data) {
		if (err) {
			return log('spotify error: ' + err);
    		//return console.log('spotify error: ' + err);
		}

		var num = Math.min(MAXsongs, data.tracks.items.length);
		
		console.log( '------------------------' );
		for(var i=0; i<num; i++){

			var track = data.tracks.items[i];
			var artists = [];
			track.artists.forEach( function(a){
				artists.push(a.name) ;
			});

			log( (i+1) + ". " +track.name );
			log( "Artists: " + artists.join(', '));
			log( "Album: " + track.album.name );
			log( "Spotify link: " + track.external_urls.spotify );
			log( '------------------------' );
		}
	});

}

function commandFromFile( filename ){

	fs.readFile("./"+filename, 'utf8', function(err, data){
		if (err) {
    		return console.log("File reading error: "+err);
  		}

  		var [cmd, prm] = data.split(',');
		log(cmd +': '+ prm);

		switch(cmd){

			case 'my-tweets':
				params = arg_arr.slice(3);
				var num = parseInt(prm) || 20;
				getTwits(num);
				break;

			case 'spotify-this-song':
				spotifySong(prm);
				break;

			case 'movie-this':
				prm.replace(/'"/g , '');
				prm.replace(/\s/g , '+');
				getMovie(prm); 
				break;

			default: 
				console.log("Unknown command in file!\nUse Cases: my-tweets/spotify-this-song/movie-this");	
				console.log('------------------------------------');
		}
	});

}

function log(text){
	console.log(text);
	fs.appendFileSync(LOGfilename, text+"\n", function(err){
		if(err){
			return console.log(err);
		}
	});
}

function logFileOnly(text){
	fs.appendFileSync(LOGfilename, text+"\n", function(err){
		if(err){
			return console.log(err);
		}
	});

}


