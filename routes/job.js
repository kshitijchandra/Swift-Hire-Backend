/**
 * Created by Sulav on 7/17/17.
 */
var express = require('express');
var router = express.Router();

// api to add new job post
router.post('/add', function (req, res, next) {

    let db = req.db;

    let userInfo = req.body.userInfo;
    let jobInfo = req.body.jobInfo;
    jobInfo.status = 'pending';

    let id = userInfo._id;

    db.users.findOne({_id: id}, function (err, dbUser) {
        if (!err) {
            if (dbUser) {
                jobInfo._id = dbUser._id + (dbUser.jobs_posted.length + 1);
                dbUser.jobs_posted.push({
                    job_id: jobInfo._id,
                    title: jobInfo.title,
                    feedback: '',
                    rating: -1,
                    preferred_date: jobInfo.preferredDate
                });

                jobInfo.posted_by = dbUser;
                jobInfo.applied_by = [];

                db.jobs.save(jobInfo);
                db.users.save(dbUser);


                res.json({
                    status: 'success',
                    job: jobInfo
                });

            } else {

                jobInfo._id = userInfo._id + "0";
                userInfo.jobs_posted = [{
                    job_id: jobInfo._id,
                    title: jobInfo.title,
                    feedback: '',
                    rating: -1,
                    preferred_date: jobInfo.preferredDate
                }];
                userInfo.jobs_applied = [];

                jobInfo.posted_by = userInfo;
                jobInfo.applied_by = [];

                db.jobs.save(jobInfo);
                db.users.save(userInfo);

                res.json({
                    status: 'success',
                    job: jobInfo
                });
            }
        } else {
            res.json({
                status: 'failed',
                message: 'Oops, something went wrong!'
            });
        }
    });
});

router.get('/search', function (req, res, next) {
    res.json({
        searchQuery: req.query.searchQuery,
        category: req.query.category,
        location: req.query.location,
        minFees: req.query.minFees
    });
});

router.post('/apply', function (req, res, next) {
    res.json(req.body);

});

router.get('/list', function (req, res, next) {
    let today = new Date().toISOString();
    req.db.jobs.find({
        'preferred_date': {$gte: today}
    }).sort({preferred_date: 1}).imit(10).toArray(function (err, data) {
        if (err) {
            res.json({
                status: 'failed',
                message: 'Oops, something went wrong!'
            });
        } else {
            res.json({
                status: 'success',
                jobs: data
            });
        }
    });
});

router.get('/list/postedjobs/:id', function (req, res, next) {
    let today = new Date().toISOString();
    req.db.jobs.find({
        'posted_by._id': req.params.id,
        'preferred_date': {$gte: today}
    }).sort({preferred_date: 1}).limit(10).toArray(function (err, data) {
        if (err) {
            res.json({
                status: 'failed',
                message: 'Oops, something went wrong!'
            });
        } else {
            res.json({
                status: 'success',
                jobs: data
            });
        }
    });
});

module.exports = router;