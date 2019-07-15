const { Pool } = require('pg');
const logger = require('./logger');
const { Observable, Subject, interval } = require('rxjs');
const { take } = require('rxjs/operators');
const marky = require('marky');
const schedule = require('node-schedule');

logger.info('hello,world');
logger.error('hello,world');
logger.warn('hello,world');
logger.info('hello,world');

const pool = new Pool();

const makeRandomString = () =>
    Math.random()
        .toString(32)
        .substring(2, 13);

const main = async idx => {
    const str = makeRandomString();
    const query = {
        name: 'add-name',
        text: `INSERT INTO "public"."demo"("name") VALUES ($1) RETURNING "id";`,
        values: [str],
    };
    const sql = `INSERT INTO "public"."demo"("name") VALUES ('${str}') RETURNING "id";`;
    const client = await pool.connect();
    try {
        logger.info(arguments.callee);
        marky.mark('add-name');
        let startTime = process.hrtime();
        const res = await client.query(query);
        let duration = process.hrtime(startTime);
        let entry = marky.stop('add-name');
        logger.info(`${duration[0]}s ${duration[1] / 1e6}ms`);
        logger.info('duration: ', entry.duration);
    } catch (error) {
        console.log(error.stack);
    } finally {
        client.release();
    }
};

// (async () => {
//     const newUser = { email: 'brian.m.carlson@gmail.com' };
//     await pool.query('INSERT INTO users(data) VALUES($1)', [newUser]);
//     const { rows } = await pool.query('SELECT * FROM users');
//     console.log(rows);
// })();

const numbers = interval(5000).pipe(take(6));

numbers.subscribe(idx => {
    main(idx).catch(e => console.log(e.stack));
});

const j = schedule.scheduleJob('*/3 * * * * *', function(fireDate) {
    console.log('The answer to life, the universe, and everything!' + fireDate);
});

process.on('SIGINT', () => {
    j.cancel();
    pool.end();
    process.exit();
});
