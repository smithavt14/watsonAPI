// Dependencies

var fs = require('fs');
var express = require('express'), app = express(), port = process.env.PORT || 3000;
var request = require('request');
var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');

var visualRecognition = new VisualRecognitionV3({
	version: '2018-03-19',
	iam_apikey: 'PXX4YNHXRxu0S5B3bVrE5rS9CuVRpFY39V6gy-TBL-fR'
});

// Methods
var download = (uri, filename, callback) => {
	request.head(uri, function(err, res, body) {
		console.log('content-type:', res.headers['content-type']);
    	console.log('content-length:', res.headers['content-length']);
    	request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
	})
}

var classify = img => {
	var img = fs.createReadStream(`${img}`)
	var classifier_ids = ["垃圾分类ai_15442162"]
	var threshold = 0.6
	var params = {
		images_file: img,
		classifier_ids: classifier_ids,
		threshold: threshold
	}

	return new Promise(resolve => {
		visualRecognition.classify(params, function(err, res) {
			if (err) { 
				console.log(err);
			} else {
				resolve(JSON.stringify(res, null, 2))
			}
		})
	})
}

// API Endpoints
app.listen(port)

app.post('/upload', (req, res) => {
	var uri = req.query.imgUrl
	var fileName = 'imgFile'

	download(uri, fileName, function() {
		classify('./imgFile')
			.then(result => {
				res.send(result)
			})
		// res.send(classification)
	})
})

console.log('todo list RESTful API server started on: ' + port);