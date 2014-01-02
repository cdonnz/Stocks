function update($http,$scope){

		$http({
			method: 'JSONP',
			url: 'http://www.foxbusiness.com/ajax/quote/'+$scope.stocks.join(",")+'?callback=jcb'
		});

		function getHeatNum(val){
			var pos = { xr : 25, xg : 136, xb : 7, yr : 35, yg : 248, yb : 0,n : 100},
			neg = { xr : 255, xg : 78, xb : 0, yr : 202, yg : 1,  yb : 1, n : 100
			}, cObj = {};

			cObj = (parseInt(val) > 0)? pos : neg;
			var pos = parseInt((Math.round((Math.abs(val)/12)*100)).toFixed(0));
			red = parseInt((cObj.xr + (( pos * (cObj.yr - cObj.xr)) / (cObj.n-1))).toFixed(0));
			green = parseInt((cObj.xg + (( pos * (cObj.yg - cObj.xg)) / (cObj.n-1))).toFixed(0));
			blue = parseInt((cObj.xb + (( pos * (cObj.yb - cObj.xb)) / (cObj.n-1))).toFixed(0));
			clr = 'rgb('+red+','+green+','+blue+')';
			return clr;
		}
		
		$scope.stockObjs = [];

		window.jcb = function(d){
			for(var i = 0; i < d.quote.length; i++){
				d.quote[i].changeClass = (parseInt(d.quote[i].percentChange) > 0)? "up" : "down";
				d.quote[i].colorC = getHeatNum(parseInt(d.quote[i].percentChange));
				$scope.stockObjs.push(d.quote[i]);
				var elm = document.getElementById("color");
			}
		}


}


var app = angular.module('myApp', []);

app.controller('stockWrap', ['$scope', '$http', function($scope, $http) {
			
	$scope.stocks= ["FB","TWTR"];

	$scope.update = function(){ 
		update($http,$scope);
	}
	setInterval(function(){
		$scope.update();
		console.log("updated");
	},3000)
	$scope.update();

}]);

app.controller('stockControl', ['$scope', function($scope) {
	$scope.addStock = {};
	$scope.sayStock = function() {
		$scope.stocks.push($scope.addStock.name.toUpperCase());
    	$scope.update();
  	}
}]);


