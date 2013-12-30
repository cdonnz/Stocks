var app = angular.module('myApp', []);

app.controller('stockWrap', ['$scope', '$http', function($scope, $http) {

	$scope.stocks= ["FB","TWTR"];

	$http({
		method: 'JSONP',
		url: 'http://www.foxbusiness.com/ajax/quote/'+$scope.stocks.join(",")+'?callback=jcb'
	});

	$scope.stockObjs = [];
	window.jcb = function(d){
		for(var i = 0; i < d.quote.length; i++){
			d.quote[i].changeClass = (parseInt(d.quote[i].percentChange) > 0)? "up" : "down";
			$scope.stockObjs.push(d.quote[i]);
		}
		console.log($scope.stockObjs,"stockObjs")

	}

}]);

app.controller('stockWrap2', ['$scope', function($scope) {}]);

