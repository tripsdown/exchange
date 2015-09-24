// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
	response.success("Hello world! :)");
});

Parse.Cloud.define("currency", function(request, response) {
	Parse.Cloud.httpRequest({
		url: 'https://www.google.com/finance/converter'
	}).then(function(httpResponse) {
		// success
		var currency_list = []
		var regexp = /<option\ +value="(\w{3})">[^<]+<\/option>/g
		while(match = regexp.exec(httpResponse.text)) {
			if (match[1] == currency_list[0]) {
				break
			}
			currency_list.push(match[1])
		}
		response.success(currency_list);
	},function(httpResponse) {
		// error
		response.success('Request failed with response code ' + httpResponse.status);
	});
});

Parse.Cloud.define("converter", function(request, response) {
	Parse.Cloud.httpRequest({
		url: 'https://www.google.com/finance/converter',
		params: {
			a : request.params.amount,
			from : request.params.from,
			to : request.params.to
		}
	}).then(function(httpResponse) {
		// success
		var regexp = /<span class=bld>([\d.]+)\s*\w{3}<\/span>/g
		var match = regexp.exec(httpResponse.text)
		if (match) {
			response.success(match[1]);
		} else {
			response.error('Unknown Error');
		}
	},function(httpResponse) {
		// error
		response.success('Request failed with response code ' + httpResponse.status);
	});
});

Parse.Cloud.job("sync", function(request, status) {
	status.success("Sync completed successfully.");
});
