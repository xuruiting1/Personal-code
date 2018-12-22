#!/usr/bin/node

var express = require('express');
var app = express();
var mysql = require('mysql');
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ddd',
    database: 'fresh'
})

con.connect();
app.all('*', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

//bodytest页面后台代码
var result='';
var selectsql='select * from question';
//查询题库中所有的问题
get(selectsql,'question');
// get方法
function get(sql, path) {
    con.query(sql, function (err, rows) {
        if (err) {
            console.error(err);
        }
        app.get('/api/' + path, function (req, res) {
            result=JSON.stringify(rows);
		    //转换成JSON String格式
		    console.log(result);
            res.send(result);
        })
    })
}
//个人测试分数的添加和更新两种操作
var insertsql='insert into scores(uid,pinghe,qixu,yangxu,yinxu,tanshi,shire,xueyu,qiyu,tebing) values(?,?,?,?,?,?,?,?,?,?)'
//如果没测试，测试后更新scores数据库的分数
post(insertsql,'question');
function post(sql, url) {
    var options = [];
    app.post('/api/' + url, function (req, res) {
        req.on('data', (data) => {
            data = JSON.parse(data);
            console.log(data);
            options = [];
            for (var i in data) {
                options.push(data[i]);
                console.log(options);
            }
               console.log(options);
            con.query(sql, [...options], function (err, result) {
                if (err) {
                    res.end(err);
                }
                console.log(result);
            });
            res.send();
        });
    })
}
//测试过后更新数据库的分数
var update='update scores set uid=?,pinghe=?,qixu=?,yangxu=?,yinxu=?,tanshi=?,shire=?,xueyu=?,qiyu=?,tebing=? where uid=?'
app.post('/api/question2', function (req, res) {
	var options = [];
	req.on('data', (data) => {
		uid = JSON.parse(data.toString('utf8')).uid;
    	console.log(uid);
        data = JSON.parse(data);
        console.log(data);
        for (var i in data) {
            options.push(data[i]);
            console.log(options);
        }
        options.push(uid);
        // console.log(options);
        con.query(update, [...options], function (err, result) {
        if (err) {
        	res.end(err);
        }
        console.log(options);
        });
        res.send();
	});
});

//查询分数进行计算主体质和倾向的体质
app.post('/api/flag',(req, res) => {
    req.on('data',(data)=>{
    	uid = JSON.parse(data.toString('utf8')).uid;
//  	console.log(uid);
	    const sql = 'select * from scores where uid=?';
	    con.query(sql,[uid],(err, results) => {
	    	if (err) {
	    		res.status(500).send('error');
	    	}
	    	res.status(200).send(results);
	    });
    })
});

//计算后更新用户信息表的主体质id
app.post('/api/question/main',(req,res)=>{
	var options=[];
	req.on('data',(data)=>{
		data = JSON.parse(data);
        console.log(data);
        for (var i in data) {
            options.push(data[i]);
            console.log(options);
        }
		var physique='update user_info set bid=? where uid=?';
		con.query(physique, [...options], function (err, result) {
        if (err) {
        	res.end(err);
        }
        console.log(options);
        });
        res.send();
	})
})
//请求用户表的体质:/api/body/main
app.post('/api/body/main',(req,res)=>{
	var options=[];
	req.on('data',(data)=>{
		uid = JSON.parse(data.toString('utf8')).uid;
		var selectphysique='select bid from user_info where uid=?';
		con.query(selectphysique,[uid],function (err, result) {
        if (err) {
        	res.end(err);
        }else{
        	res.send(result);
        	console.log(options);
        }
        
        });
        
	})
})
//查询body表中所有的体质报告中调养方法  /api/body
app.get('/api/body',(req,res)=>{
		const selectbody='select * from body';
		con.query(selectbody,function (err, result) {
        if (err) {
        	res.end(err);
        }else{
        	res.send(result);
        	console.log(result);
        }
	})
})
app.listen(8080);