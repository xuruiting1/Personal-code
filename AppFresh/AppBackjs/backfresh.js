#!/usr/bin/node

var express = require('express');
var db = require('./database');
var app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.all('*',function(req,res,next){
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

//题库页面后台代码
//查询题库中所有的问题
get('select * from question','question');
//删除题库中的问题
post('delete from question where qid=?','delete/question');
//编辑数据库中的问题
post('update question set question=? where qid=?','edit/question');
//通过体质进行筛选
post('select * from question where bid=?','somatoplasm');
//增加题目
post('insert into question (qid,question,bid) values(?,?,?)','add/question');
// get
function get(sql, path) {
    app.get('/api/' + path, function (req, res) {
        db.query(sql, function (err, result) {
            if (err) {
                console.error(err);
            }
            // console.log('result:',result);
            res.send(result);
        })
    })
}
function post(sql, url) {
    var options = [];
    app.post('/api/' + url, function (req, res) {
        var body = req.body;
        options = [];
        for (var i in body) {
            options.push(body[i]);
        }
           console.log('options',options);
        db.query(sql, [...options], function (err, result) {
            if (err) {
                res.send(err);
            }
            res.send(result);
            console.log('result:',result);
        });
    });
}

app.listen(8080);