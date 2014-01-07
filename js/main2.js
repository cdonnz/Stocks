var app = angular.module('myApp', []);

app.factory('items', function() {
    var items = [], itemsService = {};

    itemsService.add = function(item) {
        var item = item.toUpperCase();
        if(items.indexOf(item) == -1){items.push(item);}
        return items; 
    };

    itemsService.list = function() { return items;};

    itemsService.remove = function(item){
        var i = items.indexOf(item.toUpperCase());
        items.splice(i,1);     
        return items;
    };
    return itemsService;
});

app.factory('stocks',['$http',function($http){
    var stockObjs = [], grabDataService = {}, callbackFN = false;
    
    grabDataService.grabCurrent = function(){
        return stockObjs;
    }
    grabDataService.setUpdater = function(fn){
        callbackFN = fn;
    } 
    grabDataService.getAll = function(stockItems){ 
        var stocks = stockItems.join(","), stockObjs = [];
        $http({
            method: 'JSONP',
            url: 'http://www.foxbusiness.com/ajax/quote/'+stocks+'?callback=jcb'
        });
        window.jcb = function(d){
            if(!Array.isArray(d.quote)){stockObjs.push(d.quote)}
            else{
                for(var i = 0; i < d.quote.length; i++){stockObjs.push(d.quote[i]);}
            }
            callbackFN(stockObjs);
        } 
    }  
    return grabDataService;  
}]);

app.controller('stockWrap', ['$scope','items','stocks','$http', function($scope,items,stocks,$http) {
    
    //items.add("fb"); items.add("nq");
    //if stocks in url - items.add()
    //else if stocks in cookie - items.add();
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
