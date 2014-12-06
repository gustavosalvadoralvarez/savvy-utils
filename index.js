
module.exports.register_factory = function register_factory (SEAPORT_URL, SEAPORT_PORT){
  return function register_service(callback){
    var port;
    if (!(SEAPORT_URL && SEAPORT_PORT)){
      return callback("Must provide SEAPORT_URL && SEAPORT_PORT");
    }
    console.log('Registering service' + service +'@'+SEAPORT_URL+';'+SEAPORT_PORT);
    port = require('seaport').connect(SEAPORT_URL, SEAPORT_PORT);
    callback(null, port); // Return port fn for ROLE registration ==> connection PORT int
  }
}

module.exports.service_factory = function service_factory(SERVICES, AIRPORT_URL, AIRPORT_PORT){
  return function(callback){
    if (!(SERVICES && AIRPORT_URL && AIRPORT_PORT)){
      return callback("Must provide SERVICES && AIRPORT_URL && AIRPORT_PORT");
    } // Return service for ROLE registration via .connect(String)
    callback(null, require('airport')(AIRPORT_URL, AIRPORT_PORT)(obj_to_airfn(SERVICES)))
  }
  function obj_to_airfn(obj){
    var fn, k;
    fn = function(remote, conn){};
    for (k in obj){
      fn[k] = obj[k];
    }
    return fn;
  }
}

module.exports.report_factory = function report_factory(META, DST){
  // META has fields: SERVICE, PORT, URL, DST IS A WRITE STREAM
  var name, symbols;
  var symbols = {
    ok: code(2611),
    notok: code(2612),
    warning: code('26A0'),
    connect: code('21cc'),
    misc: code(2706),
    measure: code('270e'),
    analysis: code(2684)
    cluster: code('26c0'),
    service: code('26c2'),
  };
  name = [represent(META.SERVICE), location(META.URL, META.PORT)];
  return function report(subject, body){
    var report = represent(subject)+'\n\t'+ represent(body);
    return DST.write(report);
  }

  function code(point){ return '\u'+point; }

  function location (url, port) { return '@'+url+':'+ port; }

  function represent(words){
    return words.split(' ').map(
      function (word){
        return symbols[word] || word;
      }).join(' ');
  }
}



module.exports.data_structures = function mk_data(scuttlebutt){
  var self = this;

  self.results_factory = results_factory

  function results_factory (keys, next) {
      async.map(keys, _results(key, callback), next);
    }
  }


  function _results(key, callback) {
      var results = {
        'key': key,
        clicks: scuttlebutt.get(impressions(key)),
        impressions: scuttlebutt.get(key)
      }
      if (results) {
        callback(null, results);
      } else {
        callback('results not found');
      }
    }


  self.create_observation = create_observation;

  function create_observation(key, prior) {
    prior = prior || {}; //inelegant way to establish multiple arity
    scuttlebutt.set(impressions(key), prior.impressions || 0); // ! denotes impressions, chosen for its unicode brevity
    scuttlebutt.set(key, prior.clicks || 0);
  }

  self.set_priors = set_priors;

  function set_priors(priors, callback) {
    if (priors && Array.isArray(priors)) {
      priors.forEach(function _set(prior) {
        create_observation(prior.key, prior);
      })
      callback(null)
    } else {
      callback("Priors must be an array")
    }
  }

  function impressions(key) {
    return '!' + key;
  }
  return self;
}

module.exports.defaulted = function defaulted(dflt){
  return function configed(ops){
    var cf = {}, k;
    for (k in dflt){
      cf[k] = ops[k] || dflt[k];
    }
    return function start(service, callback){
      var vr;
      for (vr in cf){
        try {
          eval('var '+vr+' = '+cf[vr] +';');
        } catch (err){
          callbak(err);
        }
      }
      service();
      callback(null, service);
    }
  }
}

module.exports.queries = function (url){
  return require('querystring').parse(require('url').parse(url).querie);
}

























