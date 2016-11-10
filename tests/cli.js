
var argv = require('minimist')(process.argv.slice(2)),
	twLookup = require('../free-twilio-lookup')(),
	phoneNumbers = argv._

function processResult(err, result) {
	if (err) throw err

	console.log(result)
}

if (phoneNumbers.length > 1)
	twLookup.doLookups(phoneNumbers, processResult)
else
	twLookup.doLookup(phoneNumbers[0], processResult)