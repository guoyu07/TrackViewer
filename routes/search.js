var Render = require('../server/controller/render/render.js');
var express = require('express');

// import Render from '../server/controller/render/render';
// import express from 'express';
var logger = require('../log4js').logger;

var router = express.Router();


router.get('/getObjByTile', function (req, res, next) {
    try {
        let renderManager = new Render(req, res, next);
        renderManager['getObjByTile']();
    } catch (error) {
        logger.error(error);
        next(error);
    }
});

module.exports = router;