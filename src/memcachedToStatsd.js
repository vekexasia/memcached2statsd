import { Observable, Subject } from 'rx';
import StatsD from 'node-statsd';
import Memcache from 'memcache';

export default function ({
  memcached : { host: memcacheHost = '127.0.0.1', port: memcachePort = '11211' } = {},
  statsd : {
    host: statsdHost = '127.0.0.1',
    port: statsdPort = '8125',
    prefix = 'memcached.'
  } = {},
  metrics = ['get_hits', 'get_misses', 'curr_connections', 'rusage_user', 'bytes', 'curr_items'],
  collectionTimeMS = 1000
}) {
  const statsd      = new StatsD(statsdHost, statsdPort, prefix);
  const memcache    = new Memcache.Client(memcachePort, memcacheHost);
  const connSubject = new Subject();

  memcache.on('connect', () => connSubject.onNext());
  memcache.on('close', () => connSubject.onCompleted());
  memcache.on('timeout', () => connSubject.onCompleted());
  memcache.on('error', e => connSubject.onError(e));

  memcache.connect();

  return connSubject
    .flatMap(() => Observable.timer(collectionTimeMS, collectionTimeMS))
    .flatMap(() => Observable.fromNodeCallback(memcache.stats, memcache)())
    .flatMap(stats => Observable.from(metrics)
      .map(metric => ({ metric, value: parseFloat(stats[metric]) })))
    .map(({ metric, value }) => statsd.gauge(metric, value))
    .filter(() => false);
}
