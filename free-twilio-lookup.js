
var request = require('request')
var cheerio = require('cheerio')
var async = require('async')

function Lookup() {

	return {
		doLookup: function(phoneNumber, callback) { return doLookup(phoneNumber, callback) },
		doLookups: function(phoneNumbers, callback) { return doLookups(phoneNumbers, callback) }
	}
}

function init(callback) {

	request("https://www.twilio.com/lookup", function(error, response, html) {

		var $ = cheerio.load(html),
			visitorSid = $("[role=visitorSid]").val(),
			csrfToken = $('[name=csrfToken]').attr('content')

		callback(null, visitorSid, csrfToken)
	})
}

function reqLookup(visitorSid, csrfToken, phoneNumber, callback) {

	request.post("https://www.twilio.com/functional-demos?Type=lookup&PhoneNumber=" + phoneNumber, 
		{
			form: {
				VisitorSid: visitorSid,
				CSRF: csrfToken
			},
			gzip: true,
			headers: {
				'Cookie': 'tw-visitor=' + visitorSid
			}
		}, function(err, resp, body) {

		if (err)
			callback(err)
		else
			callback(null, JSON.parse(body).body)
	})
}

function doLookup(phoneNumber, callback) {

	async.waterfall([
		init,
		function(visitorSid, csrfToken, cb) {
			reqLookup(visitorSid, csrfToken, phoneNumber, cb)
		}
	], function(err, result) {
		if (err)
			callback(err)
		else
			callback(null, result)
	})
}

function doLookups(phoneNumbers, callback) {

	var results = []

	async.waterfall([
		init,
		function(visitorSid, csrfToken, cb) {

			async.eachLimit(phoneNumbers, 3, function(phoneNumber, eachCb) {

				reqLookup(visitorSid, csrfToken, phoneNumber, function(err, lookupResult) {
					if (err) eachCb(err)
					else {
						results.push(lookupResult)
						eachCb()
					}
				})

			}, function(err) {
				if (err) cb(err)
				else cb(null, results)
			})
		}
	], function(err, results) {
		if (err)
			callback(err)
		else
			callback(null, results)
	})
}

module.exports = Lookup

