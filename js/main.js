(function(){
    var utils = {};
    utils.cookies = (function(){
        return {
            add: function(name,value,days) {
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime()+(days*24*60*60*1000));
                    var expires = "; expires="+date.toGMTString();
                }
                else var expires = "";
                document.cookie = name+"="+value+expires+"; path=/";
            },
            remove: function(name){
                this.add(name,"",-1);
            },
            read: function(name){
                var i, nameEQ = name + "=", ca = document.cookie.split(';');
                for(i=0;i < ca.length;i++) {
                    var c = ca[i];
                    while (c.charAt(0)==' ') c = c.substring(1,c.length);
                    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
                }
                return null;
            }           
        }
    }());

    utils.heatMap = (function(){
        return {
            getRGB: function(val){
                var val = parseInt(val), n = 100, r = 233, g = 250, b = 232, pos = {r2 : 71, g2 : 226, b2 : 64},
                neg = {r2 : 207, g2 : 11, b2 : 28}, cObj = {}, p = parseInt, pos;
                val = Math.abs(val) > 40 ? 40 : val; 
                cObj = (p(val) > 0)? pos : neg; 

                pos = p((Math.round((Math.abs(val)/7)*100)).toFixed(0));
                red = p((r + (( pos * (cObj.r2 - r)) / (n-1))).toFixed(0));
                green = p((g + (( pos * (cObj.g2 - g)) / (n-1))).toFixed(0));
                blue = p((b + (( pos * (cObj.b2 - b)) / (n-1))).toFixed(0));
                
                return 'rgb('+red+','+green+','+blue+')';
            }
        }
    })();

    var app = angular.module('myApp', []);

    app.factory('items', function() {
        var items = [], itemsService = {};

        itemsService.loadCookieItems = function(){
            if(utils.cookies.read("stocks")){
                var s = utils.cookies.read("stocks"),sArr = s.split("-");
                for(var i = 0; i < sArr.length; i++){
                    itemsService.add(sArr[i]);
                }
            } 
        };

        itemsService.add = function(item) {
            var item = item.toUpperCase(), c = utils.cookies.read("stocks");
            if(c){ cArr = c.split("-");
              if(cArr.indexOf(item) == -1){ 
                cArr.push(item);
                utils.cookies.add("stocks",cArr.join("-"));
              }
            }else{
                utils.cookies.add("stocks",item);
            }
            if(items.indexOf(item) == -1){items.push(item);}
            return items; 
        };

        itemsService.list = function() { return items;};

        itemsService.remove = function(item){
            c = utils.cookies.read("stocks");
            if(c){ cArr = c.split("-"); 
                if(cArr.indexOf(item) > -1){
                    var position = cArr.indexOf(item);
                    cArr.splice(position,1);
                    utils.cookies.add("stocks",cArr.join("-"));
                }
            }            
            var i = items.indexOf(item.toUpperCase());
            items.splice(i,1);     
            return items;
        };
        return itemsService;
    });

    app.factory('stocks',['$http','items',function($http,items){
        var stockObjs = [], grabDataService = {}, callbackFN = false;

        grabDataService.initialize = function(){
            items.loadCookieItems();
            //window.stockLoading = false;
            grabDataService.setIntrvl();
        } 

        grabDataService.setIntrvl = function(){
            setInterval(function(){
    
                grabDataService.getAll(items.list());
                
                console.log("refresh attempt");
            },120000);
            items.loadCookieItems();
        } 

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
        $scope.trash = function(stock){
            items.remove(stock.ticker);
            stocks.getAll(items.list());
        }
        $scope.addShares = function(shares){
            console.log(shares)
            $scope.foo = shares;
        }
        var fn = function(stObjs){
            for(var i = 0; i < stObjs.length; i++){
                if(stObjs[i].percentChange =="n.a."){continue;}
                stObjs[i].stockColor = utils.heatMap.getRGB(stObjs[i].percentChange);
                console.log(stObjs)
            }
            $scope.stockObjs = stObjs;

        }

        stocks.initialize();
        stocks.setUpdater(fn);
        stocks.getAll(items.list());
    }]);

    app.controller('adder', ['$scope','items','stocks','$http', function($scope,items,stocks,$http) {   
        $scope.addStock = function(){
            if(typeof $scope.newStock == "undefined"){return; }
            items.add($scope.newStock);
            stocks.getAll(items.list(),$scope);
            $scope.newStock = "";
        }
    }]);

    app.controller('item', ['$scope','items','stocks','$http', function($scope,items,stocks,$http) {
        //[+] Add Shares
        $scope.addShareText = "[+] Add Shares"; 
        $scope.addShares = function(shares,current){
           
            
            console.log($scope.showValue);
            if($scope.addShareText == "[+] Add Shares"){
                $scope.addShareText = "Enter Shares";
                $scope.showShareValue = true;
            }else{
                $scope.showStockValue = true;
                $scope.shareValue = Math.round((shares * current.replace(/\,/g,''))*100)/100;
                $scope.showShareValue = false;
                $scope.addShareText = "[-] Remove Shares";
            }

            


        }
    }]);


}());