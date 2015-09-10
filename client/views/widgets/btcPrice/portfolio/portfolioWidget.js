// this only works for current user.
CF.UserAssets.getAccountsObject = function () {
  var user = Meteor.user(),
    options = Session.get("portfolioOptions");//todo: factor out
  if (!user) return {};
  var accounts = user.accounts
  /* no sooner than..
   if (options.privateAssets) {
   _.extend(accounts, user.accountsPrivate || {})

   }*/
  return accounts;
}

Template['portfolioWidget'].rendered = function () {
  this.subscribe('portfolioSystems', Session.get('portfolioOptions'))
};


// sort portfolio items by their cost, from higher to lower.
// return -1 if x > y; return 1 if y > x
CF.UserAssets.folioSortFunction = function (x, y) {
  var getPrice = function (system) {
    if (!system.metrics) return 0;
    if (!system.metrics.price) return 0;
    if (!system.metrics.price.btc) return 0;
    return system.metrics.price.btc;
  }
  var getSystem = function (system) {
    if (!system.system) return '';
    return system.system;
  }
  var accounts = CF.UserAssets.getAccountsObject();
  var q1 = CF.UserAssets.getQuantitiesFromAccountsObject(accounts, getSystem(x));
  var q2 = CF.UserAssets.getQuantitiesFromAccountsObject(accounts, getSystem(y));
  return Math.sign(q2 * getPrice(y) - q1 * getPrice(x)) || Math.sign(q2 - q1);
}

var getSumB = function () {
  var accounts = CF.UserAssets.getAccountsObject(),
    systems = CF.UserAssets.getSystemsFromAccountsObject(accounts),
    sum = 0;
  _.each(systems, function (sys) {
    var q = CF.UserAssets.getQuantitiesFromAccountsObject(accounts, sys);
    var system = CurrentData.findOne(CF.CurrentData.selectors.system(sys));

    if (system && system.metrics && system.metrics.price && system.metrics.price.btc) {
      sum += q * system.metrics.price.btc;
    }
  })
  return sum;
}

Template['portfolioWidget'].helpers({
  'pSystems': function () { //  systems to display in portfolio table, including 'starred' systems
    var options = Session.get("portfolioOptions") || {},
      user = Meteor.user(),
      systems = CF.UserAssets.getSystemsFromAccountsObject(CF.UserAssets.getAccountsObject())
    var stars = user.profile.starredSystems;
    if (stars && stars.length) {
      var plck = _.map(CurrentData.find({system: {$in: stars}},
        {fields: {'system': 1}}).fetch(), function (it) {
        return it.system;
      });
      systems = _.uniq(_.union(systems, plck))
    }
    var r = CurrentData.find(CF.CurrentData.selectors.system(systems));
    return r.fetch().sort(CF.UserAssets.folioSortFunction);
  },
  quantity: function (system) {
    if (!system.system) return NaN;

    return CF.Utils.readableN(CF.UserAssets.getQuantitiesFromAccountsObject(
      CF.UserAssets.getAccountsObject(), system.system), 3);
  }
  ,
  btcCost: function (system) {
    if (!system.system) return "no token for that system";


    if (!system.metrics || !system.metrics.price || !system.metrics.price.btc) return "no btc price found..";
    return (CF.UserAssets.getQuantitiesFromAccountsObject(
      CF.UserAssets.getAccountsObject(), system.system) * system.metrics.price.btc).toFixed(3);
  },
  usdCost: function (system) {
    if (!system.system) return "no token for that system";

    if (!system.metrics || !system.metrics.price || !system.metrics.price.usd) return "no usd price found..";
    return CF.Utils.readableN(CF.UserAssets.getQuantitiesFromAccountsObject(
      CF.UserAssets.getAccountsObject(), system.system) * system.metrics.price.usd, 2);
  },
  sumB: function () {
    var sumB = getSumB();
    return CF.Utils.readableN(sumB, 3)
  },
  name_of_system: function () {
    var sys = CurrentData.findOne({_id: this._id}) || {};
    return sys.system || ''
  },
  equity: function (system) {
    var q = 0.0;
    if (system.system) {
      q = CF.UserAssets.getQuantitiesFromAccountsObject(
        CF.UserAssets.getAccountsObject(), system.system);
    }
    if (system.metrics && system.metrics.supply) {
      q = 10000 * q / system.metrics.supply
    }
    else {
      q = 0.0;
    }
    return CF.Utils.readableN(q,3) + '‱';
  },
  share: function (system) {
    var q = 0.0;
    if (system.system) {
      q = CF.UserAssets.getQuantitiesFromAccountsObject(
        CF.UserAssets.getAccountsObject(), system.system);
    }
    var sum = getSumB();
    if (system && system.metrics && system.metrics.price
      && system.metrics.price.btc && sum>0.0) {
      return (100*q * system.metrics.price.btc / sum).toFixed(1)+"%";
    }
    return "0%";
  },
  usdPrice: function (system) { //TODO: use package functions here.
    if (system && system.metrics && system.metrics.price && system.metrics.price.usd) {
      return CF.Utils.readableN(system.metrics.price.usd, 2);
    }
    return 0;
  },
  usdCap: function (system) {
    if (system && system.metrics && system.metrics.price &&
      system.metrics.price.usd && system.metrics.supply) {
      return CF.Utils.readableN((system.metrics.price.usd * system.metrics.supply), 0);
    }
    return 0;
  },
  sumU: function () {
    var accounts = CF.UserAssets.getAccountsObject(),
      systems = CF.UserAssets.getSystemsFromAccountsObject(accounts),
      sum = 0;
    _.each(systems, function (sys) {
      var q = CF.UserAssets.getQuantitiesFromAccountsObject(accounts, sys);
      var system = CurrentData.findOne(CF.CurrentData.selectors.system( sys));

      if (system && system.metrics && system.metrics.price && system.metrics.price.usd) {
        sum += q * system.metrics.price.usd;
      }
    })
    return CF.Utils.readableN(sum, 0)
  }
});

Template['portfolioWidget'].events({
  'click .bar': function (e, t) {
    
  }
});