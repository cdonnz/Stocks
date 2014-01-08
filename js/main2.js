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
        var getHeat = function(val){
            var n = 100, r = 233, g = 250, b = 232, pos = {r2 : 71, g2 : 226, b2 : 64},
            neg = {r2 : 207, g2 : 11, b2 : 28}, cObj = {}, p = parseInt;

            cObj = (p(val) > 0)? pos : neg;
            var pos = p((Math.round((Math.abs(val)/7)*100)).toFixed(0));
            red = p((r + (( pos * (cObj.r2 - r)) / (n-1))).toFixed(0));
            green = p((g + (( pos * (cObj.g2 - g)) / (n-1))).toFixed(0));
            blue = p((b + (( pos * (cObj.b2 - b)) / (n-1))).toFixed(0));
            return 'rgb('+red+','+green+','+blue+')';
        } 
    //if stocks in url - items.add()
    //else if stocks in cookie - items.add();
    var fn = function(stObjs){
  
        for(var i = 0; i < stObjs.length; i++){
            stObjs[i].stockColor = getHeat(parseInt(stObjs[i].percentChange));
        }
        $scope.stockObjs  = stObjs;
    }
    items.add("nq");
    stocks.setUpdater(fn);
    stocks.getAll(items.list());
  
}]);

app.controller('adder', ['$scope','items','stocks','$http', function($scope,items,stocks,$http) {   
    $scope.addStock = function(){
        items.add($scope.newStock);
        stocks.getAll(items.list(),$scope);
    }
}]);
