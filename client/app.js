'use strict';

require("angular");
window.d3 = require('d3');
require("./nv.d3");
require("angularjs-nvd3-directives");
require("angular-resource");
require("moment");
var moment = require('moment');
var _ = require('lodash');

var app = angular.module('application', ['ngResource','nvd3ChartDirectives']);

app.controller('WinController', ['$scope','BetsService', function($scope,BetsService){
  $scope.latestDate = null;
  $scope.bets = {};

  // Get the summary figure and latest date
  $scope.netWinning = 0;
  BetsService.query(function(response) {
    // Assign the response INSIDE the callback
    $scope.bets = response;
    var latestDateRecord = _.chain($scope.bets).sortBy(to_date).last().value();
    $scope.latestDate = latestDateRecord.bet_date.format("DD-MMM-YYYY");
    var netWin = _.reduce($scope.bets, function(sum, bet) {
      if( bet.return > 0 ) return sum + ( bet.return - bet.bet_amt);
      return sum + (-1 * bet.bet_amt); // == 0
    },0);
    $scope.netWinning = netWin;

    // Prepare for chart
    var dateXAxis = _.chain($scope.bets)
                      .pluck("bet_date")
                      .uniq(dateXAxis, function(d) { return moment().diff(d, 'days'); })
                      .value();

    $scope.data = differentiateBetsByDate(dateXAxis,$scope.bets);

    var pieGroup = _.chain($scope.bets)
      .filter(function(f) { return f.return > 0; })
      .groupBy("bet_type")
      .map(processMapofBetType)
      .value();
    // console.log("pieGroup=",pieGroup);
    $scope.dataPie = pieGroup;

  });

  //configuration examples
  $scope.xAxisTickFormat = function(){
    return function(d){
      return window.d3.time.format('%d-%b')(new Date(d));
    };
  };

   $scope.yFunction = function(){
    return function(d){
      return d.y;
    };
  };

  $scope.xFunction = function(){
    return function(d){
      return d.x;
    };
  };

  $scope.xPieFunction = function(){
    return function(d){
      return d.bet_type;
    };
  };

  $scope.yPieFunction = function(){
    return function(d){
      return d.total_return;
    };
  };

}]);

app.factory('BetsService', function($resource){
  return $resource('/api/bets', {});
});

function accumulateBetTypeGroup( totals, bet ) {
  // console.log("totals=",totals);
  // console.log("bet=",bet);
  return {
    bet_type:bet.bet_type,
    total_return:totals.total_return + bet.return
  };
}

function processMapofBetType( betTypeGroup ){
  // console.log("betTypeGroup=",betTypeGroup);
  return _.reduce( betTypeGroup, accumulateBetTypeGroup, { total_return:0 } );
}

function to_date(o) {
  o.bet_date = moment(o.bet_date, "DD-MMM-YYYY");
  return o;
}

function differentiateBetsByDate( theDates, theBets )
{

  var total_bets = [];
  var total_returns = [];
  var win_lose = [];

  _.forEach(theDates,function(date){
    total_bets.push( {x:date.valueOf(), y:0});
    total_returns.push({x:date.valueOf(), y:0});
    win_lose.push({x:date.valueOf(), y:0});
  });

  _.forEach(theBets, function(the_bet) {
    var bet_date_to_find = the_bet.bet_date;
    var pos = _.findIndex(theDates, function(the_date) {
      return moment(bet_date_to_find).isSame( the_date, 'day');
    });
    total_bets[pos].y = total_bets[pos].y + the_bet.bet_amt;
    total_returns[pos].y = total_returns[pos].y + the_bet.return;
    win_lose[pos].y = win_lose[pos].y + ( the_bet.return - the_bet.bet_amt );
  });

  return [
    {
      values: total_bets,
      key: 'Total Bets',
      color:"#112F41"
    },
    {
      values: total_returns,
      key: 'Total Returns'
    }
  ];
}

