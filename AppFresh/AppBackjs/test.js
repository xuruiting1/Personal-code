#!/usr/bin/node

var express = require('express');
var db = require('./database');
var app = express();
app.all('*',function(req,res,next){
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});
// 体质测试
console.log('体质测试');
var question = "select * from question"

GetQuestion(question, "question");
function GetQuestion(sql, path) {
    db.query(sql, function (err,result) {
        if (err) {
            console.error(err);
        }
        app.post('/api/' + path, function (req, res) {
			console.log('体质测试');
            res.send(result);
        })
    })
}
console.log('体质测试2');
app.listen(8080);


//app.post('/api/question',function (req,res,next) {
//db.query(selectsql,function(err,rows){
//  if(err){
//    console.log(err);
//    return;
//  }
////  for(var i in rows){
////  	console.log(rows);
////  	var temp=rows[i].id;
////  	console.log(temp);
////  }
//  result=JSON.stringify(rows);
//  //转换成JSON String格式
//  console.log(result);
//  res.end(result);
//});
//
//});
