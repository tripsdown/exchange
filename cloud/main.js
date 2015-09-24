// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
	response.success("Hello world!");
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

function combinations(arr, k) {
	var i,
		subI,
		ret = [],
		sub,
		next;
	for (i = 0; i < arr.length; i++) {
		if (k === 1) {
			ret.push([arr[i]]);
		} else {
			sub = combinations(arr.slice(i+1, arr.length), k-1);
			for (subI = 0; subI < sub.length; subI++) {
				next = sub[subI];
				next.unshift(arr[i]);
				ret.push(next);
			}
		}
	}
	return ret;
}

CURRENCY = ['TWD', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'HKD', 'RMB']

Parse.Cloud.job("sync", function(request, status) {
	var count = 0;
	var number = 0;

	combinations(CURRENCY, 2).forEach(function(currentValue) {
		count++;

		Parse.Cloud.httpRequest({
			url: 'https://www.google.com/finance/converter',
			params: {
				a : 1,
				from : currentValue[0],
				to : currentValue[1]
			}
		}).then(function(httpResponse) {
			// success
			var regexp = /<span class=bld>([\d.]+)\s*\w{3}<\/span>/g
			var match = regexp.exec(httpResponse.text)
			if (match) {
				console.log('1 ' + currentValue[0] + ' = ' + match[1] + ' ' + currentValue[1]);
			} else {
				console.log('Unknown Error');
			}
			number++;
		},function(httpResponse) {
			// error
			console.log('Request failed with response code ' + httpResponse.status);
			number++;
		});

		if (count == number) {
			status.success("Sync completed successfully.");
		}
	});
});
