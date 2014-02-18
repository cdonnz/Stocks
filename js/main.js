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
            },
            updateItemsCookie: function(itemsArr){
                var self = this;
                //console.log("COOKIE UPDATE:",itemsArr)
                utils.cookies.remove("stocks");
                self.add("stocks",itemsArr.join("-"),itemsArr);
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
            var item = item.toUpperCase();

            if(items.indexOf(item) == -1){
                items.push(item);
            }
            utils.cookies.updateItemsCookie(items);
            return items;
        };

        itemsService.list = function() { return items;};

        itemsService.remove = function(item){
            console.log("rem",item,items,item.split(":")[0])
            var tempArr = [];
            for(var j = 0; j < items.length; j++){
                 if( items[j].indexOf(item.split(":")[0]) == -1){
                    tempArr.push(items[j])
                 }
            }
            items = tempArr;
            utils.cookies.updateItemsCookie(items);
            return items;
        };

        itemsService.appendShares = function(item,shares,$scope){
            var self = this,len = items.length;
            for(var i = 0; i < len; i++){
                //if stock exists, add shares
                if(items[i].indexOf(item) > -1){
                    items[i] = item + ":" + shares;

                }
            }
            utils.cookies.updateItemsCookie(items);
        }

        return itemsService;
    });

    app.factory('stocks',['$http','items',function($http,items){
        var stockObjs = [], grabDataService = {}, callbackFN = false;

        grabDataService.initialize = function(){
            window.isLocked = false;
            items.loadCookieItems();
            grabDataService.getAll(items.list());
            //grabDataService.setIntrvl();
        }

        grabDataService.setTOut = function(){
            window.setTimer = setTimeout(function(){
                grabDataService.getAll(items.list());

            },1000);
            //items.loadCookieItems();
        }

        grabDataService.grabCurrent = function(){
            return stockObjs;
        }
        grabDataService.setUpdater = function(fn){
            callbackFN = fn;
        }
        grabDataService.getAll = function(stockItems){
            var tempArr = [], stObjs = [];
            for(var x = 0; x < stockItems.length; x++){
                tempArr.push(stockItems[x].match(/[A-Z]+/)[0])
            }
            var stocks = tempArr.join(",");

            $http({
                method: 'JSONP',
                url: 'http://www.foxbusiness.com/ajax/quote/'+stocks+'?callback=jcb'
            });
            window.jcb = function(d){
                if(!window.isLocked){
                    if(!Array.isArray(d.quote)){stObjs.push(d.quote);}
                    else{
                        for(var i = 0; i < d.quote.length; i++){stObjs.push(d.quote[i]);}
                    }
                    callbackFN(stObjs);
                    window.clearInterval(window.setTimer)
                    grabDataService.setTOut();
                    console.log("refresh")
                }
            }
        }
        return grabDataService;
    }]);

    app.controller('stockWrap', ['$scope','items','stocks','$http', function($scope,items,stocks,$http) {
        $scope.trash = function(stock){
            items.remove(stock.ticker);
            var temp = [];
            var len = $scope.stockObjs.length;
            for(var u = 0; u < len;u++){
                if($scope.stockObjs[u].ticker != stock.ticker){
                    temp.push($scope.stockObjs[u]);
                }
            }
            $scope.stockObjs = temp;
        }
        $scope.addShares = function(shares){

            $scope.foo = shares;
        }
        var fn = function(stObjs){
            var list = items.list(), tempArr = [], len = list.length;
            //console.log(list)
            for(var j = 0; j < list.length; j++){
                for(var i = 0; i < stObjs.length; i++){
                    var listSym = list[j].split(":")[0];
                    if(listSym === stObjs[i].ticker){
                        stObjs[i].stockColor = utils.heatMap.getRGB(stObjs[i].percentChange);
                        var shareNum = list[j].split(":")[1];
                        if(Boolean(shareNum)){
                            var shareCurrent = Number(stObjs[i].current.replace(/[,]/g,""));

                            if(shareCurrent ){
                                shareCurrent = shareCurrent.toString();
                                stObjs[i].shareValue = Math.round((shareNum * shareCurrent.replace(/\,/g,''))*100)/100;
                            }
                        }else{stObjs[i].shareValue = "";}

                        tempArr.push(stObjs[i]);
                    }
                }
            }
            console.log(len, tempArr.length)
            if(tempArr.length == len){
                $scope.stockObjs = tempArr;
            }
        }

        stocks.initialize();
        stocks.setUpdater(fn);
        stocks.getAll(items.list());
    }]);

    app.controller('adder', ['$scope','items','stocks','$http', function($scope,items,stocks,$http) {
        $scope.addStock = function(){
            if(typeof $scope.newStock == "undefined" || !(/^[a-z,A-Z]+$/.test($scope.newStock)) ){ $scope.newStock = ""; return; }
            items.add($scope.newStock);
           // stocks.getAll(items.list());
            $scope.newStock = "";
        }
    }]);

    app.controller('item', ['$scope','items','stocks','$http', function($scope,items,stocks,$http) {
        //[+] Add Shares
        $scope.addShareText = "[+] Add Shares";
        $scope.addShares = function(shares,current,symbol,s){
            window.isLocked = true;
            if($scope.addShareText == "[+] Add Shares"){
                $scope.addShareText = "Enter Shares";
                $scope.showShareValue = true;
            }else{
                $scope.showStockValue = true;

                items.appendShares(symbol,shares,$scope);


                //$scope.showShareValue = true;
                //var elm = $scope.find('.b');
                //console.log(elm);
                $scope.addShareText = "[-] Remove Shares";
                window.isLocked = false;
            }

        }
    }]);

}());