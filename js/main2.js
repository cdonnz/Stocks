var app = angular.module('myApp', []);

app.factory('items', function() {
    var items = [];
    var itemsService = {};

    itemsService.add = function(item) {
        items.push(item.toUpperCase());
    };
    itemsService.list = function() {
        return items;
    };
    itemsService.remove = function(item){
        console.log("not implented yet");
        return 
    }

    return itemsService;
});

app.factory('stocks',['$http',function($http){
    var stockObjs = [];
    var grabDataService = {};
    var callbackFN = false;
    grabDataService.grabCurrent = function(){
        return stockObjs;
    }
    grabDataService.setUpdater = function(fn){
        callbackFN = fn;
    } 
    grabDataService.getAll = function(stockItems){ 
        var stocks = stockItems.join(",");
        $http({
            method: 'JSONP',
            url: 'http://www.foxbusiness.com/ajax/quote/'+stocks+'?callback=jcb'
        });
        stockObjs = [];
        window.jcb = function(d){
            for(var i = 0; i < d.quote.length; i++){console.log(d.quote[i].ticker)
                stockObjs.push(d.quote[i]);
            }
            console.log(stockObjs);
            callbackFN(stockObjs);
        } 
    }  
    return grabDataService;  
}]);

app.controller('stockWrap', ['$scope','items','stocks','$http', function($scope,items,stocks,$http) {
    items.add("fb"); items.add("nq");
    var fn = function(stObjs){$scope.stockObjs  = stObjs;}
    stocks.setUpdater(fn);
    stocks.getAll(items.list());
}]);

app.controller('adder', ['$scope','items','stocks','$http', function($scope,items,stocks,$http) {   
    $scope.addStock = function(){
        items.add($scope.newStock);  
        stocks.getAll(items.list(),$scope);
    }
}]);
