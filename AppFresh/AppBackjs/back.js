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

//var loginflag;登录状态返回消息 
//1成功并返回用户账号 0密码空 -1用户不存在 -2密码错误  -3手机号空
app.post('/login',function(req,res){
	var chunk='';
	req.on('data',(data)=>{
		chunk=JSON.parse(data);	
		compare(chunk.tel,chunk.pwd,res);
	});
});
//登录模块与数据库用户信息比较函数
function compare(account,password,res){
  const sql='select * from register where account=?'; 
  if(!password){
    // console.log("密码不能为空");
    res.end('0');
  }
  if(!account){
    // console.log("手机号不能为空");
    res.end('-3');
  }
  if(account && password){
     db.query(sql,[account],(err,result)=>{
        if(err){
        //   console.error("Error:",err);
          res.status(500).send('DB ERROR!');
        }
        if(!result[0]){
            // console.log("用户名不存在");
            res.end('-1');
        }else{
            if(result[0].password==password){
                //登陆成功
                // console.log("Success");
                res.end('1');
            }else{
                // console.log("密码错误");
                res.end('-2');
            }
        }
     });
  }
}


// /////////////////////////////////////////////////////////////////////////////
//Home

var uid;
app.post('/',(req,res)=>{
    // console.log(req.url);
    if(req.url==='/' && req.method==='POST'){
        req.on('data',(data)=>{
            uid = JSON.parse(data.toString('utf8')).uid;
            // console.log(uid);
        });
        
        req.on('end',()=>{});
    }
});

// 宜忌
app.get('/yiji',(req,res)=>{
    const sql = 'select * from shoulds where bid in (select bid from user_info where uid=?)';
    if(!uid){  //uid为空  未知体质状况  uid位默认平和质用户
        db.query(sql, [1], (err, results) => {  //此处要求数据库必须有一个默认系统创建的用户（平和质） uid=1并且bid=1
            if (err) {
                // console.log(err.message);
                res.status(500).send('DB error');
            }
            res.status(200).send(results);
        });
    }
    else{  // bid非空  已知体质状况        
        db.query(sql, [uid], (err, results) => {
            if (err) {
                // console.log(err.message);
                res.status(500).send('DB error');
            }
            res.status(200).send(results);
        });
    }    
});

//推荐
app.get('/tuijian', (req, res) => {
    // console.log(req.url);
    const sql = 'select * from recommend where bid in (select bid from user_info where uid=?)';
    if(!uid){  //uid为空  未知体质状况  uid位默认平和质用户
        db.query(sql, [1], (err, results) => {  //此处要求数据库必须有一个默认系统创建的用户（平和质） uid=1并且bid=1
            if (err) {
                // console.log(err.message);
                res.status(500).send('DB error');
            }
            res.status(200).send(results);
        });
    }
    else{  // bid非空  已知体质状况        
        db.query(sql, [uid], (err, results) => {
            if (err) {
                // console.log(err.message);
                res.status(500).send('DB error');
            }
            res.status(200).send(results);
        });
    }
})
//健身方面
app.get('/jianshen', (req, res) => {
    // console.log(req.url);
    const sql = 'select * from recommend where cid=1 and bid in (select bid from user_info where uid=?)';
    if(!uid){  //uid为空  未知体质状况
        db.query(sql, [1], (err, results) => {
            if (err) {
                // console.log(err.message);
                res.status(500).send('DB error');
            }
            res.status(200).send(results);
        });
    }
    else{  // uid非空  已知体质状况        
        db.query(sql, [uid], (err, results) => {
            if (err) {
                // console.log(err.message);
                res.status(500).send('DB error');
            }
            res.status(200).send(results);
        });
    }
})
//饮食方面
app.get('/yinshi', (req, res) => {
    // console.log(req.url);
    const sql = 'select * from recommend where cid=2 and bid in (select bid from user_info where uid=?)';
    if(!uid){  //uid为空  未知体质状况
        db.query(sql, [1], (err, results) => {
            if (err) {
                // console.log(err.message);
                res.status(500).send('DB error');
            }
            res.status(200).send(results);
        });
    }
    else{  // uid非空  已知体质状况        
        db.query(sql, [uid], (err, results) => {
            if (err) {
                // console.log(err.message);
                res.status(500).send('DB error');
            }
            res.status(200).send(results);
        });
    }
})
//理疗方面
app.get('/liliao', (req, res) => {
    // console.log(req.url);
    const sql = 'select * from recommend where cid=3 and bid in (select bid from user_info where uid=?)';
    if(!uid){  //uid为空  未知体质状况
        db.query(sql, [1], (err, results) => {
            if (err) {
                // console.log(err.message);
                res.status(500).send('DB error');
            }
            res.status(200).send(results);
        });
    }
    else{  // uid非空  已知体质状况        
        db.query(sql, [uid], (err, results) => {
            if (err) {
                // console.log(err.message);
                res.status(500).send('DB error');
            }
            res.status(200).send(results);
        });
    }
});

///////////////////////////////////////////////////////////
//Hometail

app.post('/hometail',(req,res)=>{
    if(req.url==='/hometail' && req.method==="POST"){
        req.on('data',(data)=>{
            title = JSON.parse(data.toString('utf8')).title;
            // console.log(title);
        });
        
        req.on('end',()=>{});
    }
});

app.get('/hometail',(req,res)=>{
    const sql = 'select * from recommend where title=?';
    db.query(sql,[title],(err,results)=>{
        if(err){
            res.status(500).send('DB error');
        }
        res.status(200).send(results);
    });
});

// 添加收藏
var rid;
app.post('/collection',(req,res)=>{
    if(req.url==="/collection" && req.method==="POST"){
        req.on('data',(data)=>{
            // console.log(data);
            rid = JSON.parse(data.toString('utf8')).rid;
            uid = JSON.parse(data.toString('utf8')).uid;
            console.log("rid: ",rid);
            console.log("uid: ",uid);

            const sql = 'insert into collection(uid,rid,cid) values(?,?,4)';
            db.query(sql,[uid,rid],(err,results)=>{
                if(err){
                    res.status(500).send('DB error');
                }
                res.status(200).send();
            })
        });

        req.on('end',()=>{});
    }
});



app.listen(8080);
