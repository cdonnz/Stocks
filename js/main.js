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

    app.factory('stockModel',['$http',function($http){
        var SM = {};
        SM.stockArr = [];

        SM.initialize = function(){
            var str = utils.cookies.read("stocks"), tickersArr = str? str.split("-") :  false;

            if(str){
                for(var t = 0; t < tickersArr.length; t++){
                    tArr = tickersArr[t].split(":");

                    var obj = {
                        name   : tArr[0],
                        shares : tArr[1]
                    }

                    SM.stockArr.push(obj);
                }
            }
            SM.getFeed();
            SM.setTimer();
        };
      
        SM.setTimer = function(){
            window.ST = setTimeout(function(){
                SM.getFeed();
            },2000)
        };

        SM.getFeed = function(){
            var tempArr = [];

            for(var x = 0; x < SM.stockArr.length; x++){
               tempArr.push(SM.stockArr[x].name);
            }

            var stocks = tempArr.join(",");
console.log("exe")
            $http({
                method: 'JSONP',
                url: 'http://www.foxbusiness.com/ajax/quote/'+stocks+'?callback=jcb'
            });

        };

        SM.addStock = function(newStock){
            var smArr = SM.stockArr, found = false;

            for(var s = 0; s < smArr.length; s++){
                if(newStock === smArr[s].name){
                    found = true;
                }
            }
            if(found == false){
                var obj = {
                    name: newStock
                }
              SM.stockArr.push(obj);
            }
            SM.getFeed();
            SM.updateCookie();
        };

        SM.removeStock = function(stock){
            var smArr = SM.stockArr, tempArr = [], found = false;

            for(var s = 0; s < smArr.length; s++){
                if(stock !== smArr[s].name){
                    tempArr.push(smArr[s]);
                }
            }

            SM.stockArr = tempArr;
            SM.updateCookie();

        };

        SM.addShares = function(stock,shares){
            var smArr = SM.stockArr, tempArr = [];

            for(var s = 0; s < smArr.length; s++){
                if(stock === smArr[s].name){
                    SM.stockArr[s].shares = shares;
                    if(shares === 0){
                      SM.stockArr[s].value = "";  
                    }
                    break;
                }
            }

            SM.updateCookie();

        };

        SM.updateCookie = function(){
            var smArr = SM.stockArr, cArr = [];

            //remove all cookie info
            utils.cookies.remove("stocks");

            for(var s = 0; s < smArr.length; s++){
                var shares = smArr[s].shares;
                if(shares){
                    cArr.push(smArr[s].name + ":" + smArr[s].shares);
                }else{
                    cArr.push(smArr[s].name);
                }

            }

            utils.cookies.add("stocks",cArr.join("-"));
        }

        return SM;

    }]);

    app.controller('stockWrap', ['$scope','stockModel','$http', function($scope,stockModel,$http) {


        var fixNum = function(num){return num.replace(/\,/g,'');}

        window.jcb = function(d){
            var dArr = [];
            var smArr = stockModel.stockArr;
            //set up data array
            if(!Array.isArray(d.quote)){dArr.push(d.quote);}
            else{
                for(var i = 0; i < d.quote.length; i++){dArr.push(d.quote[i]);}
            }

            //iterate through local model array
            for(var s = 0; s < smArr.length; s++){
                var sym = smArr[s].name

                for(var d = 0; d < dArr.length; d++){
                    if(sym === dArr[d].ticker){
                        smArr[s].stockColor = utils.heatMap.getRGB(dArr[d].percentChange);
                        var current = dArr[d].current.toString();
                        var currentNoComma = Number(current.replace(/[,]/g,""));
                        if(smArr[s].shares){
                            smArr[s].valueLabel = "value";
                            smArr[s].value = Math.round((currentNoComma * smArr[s].shares)*100)/100;
                            if(smArr[s].shares == 0){smArr[s].value = "";}
                        }else{ smArr[s].valueLabel = "";}
                        smArr[s].current = current;
                        smArr[s].change = dArr[d].percentChange;
                    }
                }
            }
            $scope.stockObjs = smArr;
            console.log("refresh");
            clearTimeout(ST);
            stockModel.setTimer();
        }

        $scope.trash = function(stock){

            stockModel.removeStock(stock.name);
            $scope.stockObjs = stockModel.stockArr;

        }

        stockModel.initialize();
    }]);


    app.controller('adder', ['$scope','stockModel','$http', function($scope,stockModel,$http) {
        $scope.addStock = function(){
            if(typeof $scope.newStock == "undefined" || !(/^[a-z,A-Z]+$/.test($scope.newStock)) ){ $scope.newStock = ""; return; }

            stockModel.addStock($scope.newStock.toUpperCase())
            $scope.newStock = "";
        }
    }]);

    app.controller('item', ['$scope','stockModel','$http', function($scope,stockModel,$http) {
        //[+] Add Shares
        $scope.addShareText = "[+] Add Shares";

        $scope.addShares = function(shares,current,symbol,s){

            window.isLocked = true;

            if($scope.addShareText == "[+] Add Shares"){
                $scope.addShareText = "Enter Shares";
                $scope.showShareValue = true;
            }else if($scope.addShareText == "[-] Remove Shares"){
                stockModel.addShares(symbol,0);
                stockModel.getFeed();
                $scope.share = 0;
                $scope.addShareText = "[+] Add Shares"
            }
            else{
                if(/[0-9]+/.test(shares)){
                    $scope.showShareValue = false;
                    stockModel.addShares(symbol,shares);
                    stockModel.getFeed();
                    $scope.addShareText = "[-] Remove Shares";
                }
                window.isLocked = false;
            }

        }
    }]);

}());