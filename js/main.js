var app = angular.module('myApp', []);

app.controller('stockWrap', ['$scope', '$http', function($scope, $http) {

			$scope.getCSSbackgrd = function(){alert("getcss")
				//return 'background-color:'+ d.quote[i].colorC;
				return "background-color:rgb(242,59,0)";
			}
	$scope.stocks= ["FB","TWTR"];

	$http({
		method: 'JSONP',
		url: 'http://www.foxbusiness.com/ajax/quote/'+$scope.stocks.join(",")+'?callback=jcb'
	});

	function getHeatNum(val){
		val = Math.abs(val);
		var pos = parseInt((Math.round((val/12)*100)).toFixed(0));
		red = parseInt((xr + (( pos * (yr - xr)) / (n-1))).toFixed(0));
		green = parseInt((xg + (( pos * (yg - xg)) / (n-1))).toFixed(0));
		blue = parseInt((xb + (( pos * (yb - xb)) / (n-1))).toFixed(0));
		clr = 'rgb('+red+','+green+','+blue+')';
		return clr;
	}
	var xr = 255, xg = 78, xb = 0, yr = 202, yg = 1,  yb = 1,n = 100;
	$scope.stockObjs = [];

	window.jcb = function(d){
		for(var i = 0; i < d.quote.length; i++){
			d.quote[i].changeClass = (parseInt(d.quote[i].percentChange) > 0)? "up" : "down";
			console.log(getHeatNum(parseInt(d.quote[i].percentChange),"xxxx"))
			//d.quote[i].colorC = getHeatNum(parseInt(d.quote[i].percentChange));
			$scope.stockObjs.push(d.quote[i]);
			var elm = document.getElementById("color");

		
			//$scope.divColor = d.quote[i].colorC;

			$scope.getCSSbackgrd = function(){alert("getcss")
				//return 'background-color:'+ d.quote[i].colorC;
				return "background-color:rgb(242,59,0)";
			}
			//elm.style.backgroundColor = d.quote[i].colorC;
			
		}
		console.log($scope.stockObjs,"stockObjs");
	}
}]);

app.controller('stockWrap2', ['$scope', function($scope) {}]);




