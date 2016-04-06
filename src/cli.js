#!/usr/bin/env node
/* eslint-disable no-console, key-spacing */

import program from 'commander';
import memcachedToStatsd from './memcachedToStatsd';

program
  .version('1.0.0')
  .usage('[options]')
  .option('--sh [statsdHost]', 'The statsd host/ip', '127.0.0.1')
  .option('--sp [statsdPort]', 'The statsd port', '8125')
  .option('--sprefix [statsdPrefix]', 'The statsd prefix', 'memcached.')
  .option('--mh [memcachedHost]', 'The memcached daemon host/ip', '127.0.0.1')
  .option('--mp [memcachedPort]', 'The memcached daemon Port', '11211')
  .option('--ct [collectMSTime]', 'The collection time of each metric (dft: 1000)', 1000)
  .parse(process.argv);


memcachedToStatsd(
  {
    statsd          : {
      host  : program.sh,
      port  : program.sp,
      prefix: program.sprefix
    },
    memcached       : {
      host: program.mh,
      port: program.mp
    },
    collectionTimeMS: parseInt(program.ct, 10)
  }
).subscribe(
  console.log,
  error => {
    console.error(`An error has occurred!`);
    console.error(error);
    console.error(error.stack);
  },
  () => console.log('completed')
);
