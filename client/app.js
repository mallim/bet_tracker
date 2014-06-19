'use strict';

require("angular");
window.d3 = require("d3");
require("./nv.d3");
require("angular-nvd3");
require("angular-resource");
require("moment");
var moment = require('moment');
var _ = require('lodash');
var accounting = require("accounting");

accounting.settings.currency.format = {
  pos : "%s %v",   // for positive values, eg. "$ 1.00" (required)
  neg : "%s (%v)", // for negative values, eg. "$ (1.00)" [optional]
  zero: "%s  -- "  // for zero values, eg. "$  --" [optional]
};

var app = angular.module('application', ['ngResource','nvd3']);

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
    $scope.netWinning = accounting.formatMoney(netWin);

    // Prepare for chart
    var dateXAxis = _.chain($scope.bets)
                      .pluck("bet_date")
                      .uniq(dateXAxis, function(d) { return moment().diff(d, 'days'); })
                      .value();
    // console.log("dateXAxis", dateXAxis);

    $scope.data = differentiateBetsByDate(dateXAxis,$scope.bets);
    console.log( "$scope.data=",$scope.data);

    // var dateXAxis2 = _.uniq(dateXAxis, function(d) { return moment().diff(d, 'days'); });
    // console.log("dateXAxis2", dateXAxis2);
  });

  $scope.options = {
    chart: {
      type: 'lineChart',
      height: 450,
      margin : {
        top: 20,
        right: 20,
        bottom: 40,
        left: 55
      },
      x: function(d){
        return d.x;
      },
      y: function(d){
        return d.y;
      },
      useInteractiveGuideline: true,
      xAxis: {
        axisLabel: 'Bet Dates'
      },
      yAxis: {
        axisLabel: 'Amount ($)',
        axisLabelDistance: 30
      }
    },
    title: {
      enable: true,
      text: 'Title for Line Chart'
    }
  };

}]);

app.factory('BetsService', function($resource){
  return $resource('/api/bets', {});
});

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
    total_bets.push( {x:date.format("DD-MMM-YYYY"), y:0});
    total_returns.push({x:date.format("DD-MMM-YYYY"), y:0});
    win_lose.push({x:date.format("DD-MMM-YYYY"), y:0});
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
      values: total_bets,      //values - represents the array of {x,y} data points
      key: 'Total Bets' //key  - the name of the series.
      // color: '#ff7f0e'  //color - optional: choose your own line color.
    },
    {
      values: total_returns,
      key: 'Total Returns'
      // color: '#2ca02c'
    },
    {
      values: win_lose,
      key: 'Win/Lose',
      // color: '#7777ff'
      area: true      //area - set to true if you want this line to turn into a filled area chart.
    }
  ];
}

