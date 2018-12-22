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
//查询题库所有的题


//登录
app.post('/api/login',function(req,res){
	var chunk='';
  const sql='select * from register where account=?'; 
	req.on('data',(data)=>{
		chunk=JSON.parse(data);	
    con.query(sql,[chunk.tel],(err,result)=>{
      if(err){
          console.error("Error:",err);
          res.status(500).end('con ERROR!');
      }else{
        res.send(result);
      }
    });
  });
});
app.post('/api/login/status',function(req,res){
  req.on('data',(data)=>{
    data=JSON.parse(data).tel;
    console.log(data);
    
    con.query("update register set loginStatus='1' where account=?",[data],function(err,result){
      if(err){
          console.error("Error:",err);
          res.status(500).end('con ERROR!');
      }
      console.log(result);
    });
  })
});


//注册
app.post('/api/register',function(req,res){
  req.on('data',(data)=>{
    data=JSON.parse(data);
    con.query('select * from register where account=?',[data.tel],function(err,result){
      if(err){
        res.status(500).end('con ERROR!');
      }if(result[0]){
        res.end('0');
      }else{
        con.query('insert into register(account,password) values(?,?)',[data.tel,data.pwd],(err,result)=>{
          if(err){
            res.status(500).end('con ERROR!');
          }
        })
      }
    });
  });
});



// var register = 'insert into register(account,password) values(?,?)';
// post(register, "register");
// //post
// function post(sql, url) {
//     var options = [];
//     app.post('/api/' + url, function (req, res) {
//         req.on('data', (data) => {
//             data = JSON.parse(data);
//             console.log(data);
//             options=[];
//             for (var i in data) {
//                 options.push(data[i]);
//             }
//             // console.log(options);
//             con.query(sql, [...options], function (err, result) {
//                 if (err) {
//                     res.end(err);
//                 }
//             console.log(result);
//             });
//             res.send();
//         });
//     })
// }

// 动态
var contact = "select * from dynamic"
get(contact, "contact");
// get
function get(sql, path) {
    con.query(sql, function (err, result) {
        if (err) {
            console.error(err);
        }
        app.get('/api/' + path, function (req, res) {
            //console.log(result);
            res.send(result);
        })
    })
}


//Home
var uid;
app.post('/api',(req,res)=>{
    // console.log(req.url);
    if(req.url==='/' && req.method==='POST'){
        req.on('data',(data)=>{
            uid = JSON.parse(data.toString('utf8')).uid;
//             console.log(uid);
        });  
        req.on('end',()=>{});
    }
});

//推荐
app.get('/api/tuijian', (req, res) => {
    // console.log(req.url);
    const sql = 'select * from recommend where bid in (select bid from user_info where uid=?)';
    if(!uid){  //uid为空  未知体质状况  uid位默认平和质用户
        con.query(sql, [1], (err, results) => {  //此处要求数据库必须有一个默认系统创建的用户（平和质） uid=1并且bid=1
            if (err) {
                // console.log(err.message);
                res.status(500).send('con error');
            }
            res.status(200).send(results);
        });
    }
    else{  // bid非空  已知体质状况        发发发
        con.query(sql, [uid], (err, results) => {
            if (err) {
                // console.log(err.message);
                res.status(500).send('con error');
            }
            res.status(200).send(results);
        });
    }    
})
//健身方面
app.get('/api/jianshen', (req, res) => {
    // console.log(req.url);
    const sql = 'select * from recommend where cid=1 and bid in (select bid from user_info where uid=?)';
    if(!uid){  //uid为空  未知体质状况
        con.query(sql, [1], (err, results) => {
            if (err) {
                // console.log(err.message);
                res.status(500).send('con error');
            }
            res.status(200).send(results);
        });
    }
    else{  // uid非空  已知体质状况        
        con.query(sql, [uid], (err, results) => {
            if (err) {
                // console.log(err.message);
                res.status(500).send('con error');
            }
            res.status(200).send(results);
        });
    }
})
//饮食方面
app.get('/api/yinshi', (req, res) => {
    // console.log(req.url);
    const sql = 'select * from recommend where cid=2 and bid in (select bid from user_info where uid=?)';
    if(!uid){  //uid为空  未知体质状况
        con.query(sql, [1], (err, results) => {
            if (err) {
                // console.log(err.message);
                res.status(500).send('con error');
            }
            res.status(200).send(results);
        });
    }
    else{  // uid非空  已知体质状况        
        con.query(sql, [uid], (err, results) => {
            if (err) {
                // console.log(err.message);
                res.status(500).send('con error');
            }
            res.status(200).send(results);
        });
    }
})
//理疗方面
app.get('/api/liliao', (req, res) => {
    // console.log(req.url);
    const sql = 'select * from recommend where cid=3 and bid in (select bid from user_info where uid=?)';
    if(!uid){  //uid为空  未知体质状况
        con.query(sql, [1], (err, results) => {
            if (err) {
                // console.log(err.message);
                res.status(500).send('con error');
            }
            res.status(200).send(results);
        });
    }
    else{  // uid非空  已知体质状况        
        con.query(sql, [uid], (err, results) => {
            if (err) {
                // console.log(err.message);
                res.status(500).send('con error');
            }
            res.status(200).send(results);
        });
    }
});

///////////////////////////////////////////////////////////
//Hometail

app.post('/api/hometail',(req,res)=>{
    if(req.url==='/hometail' && req.method==="POST"){
        req.on('data',(data)=>{
            title = JSON.parse(data.toString('utf8')).title;
            // console.log(title);
        });
        
        req.on('end',()=>{});
    }
});

app.get('/api/hometail',(req,res)=>{
    const sql = 'select * from recommend where title=?';
    con.query(sql,[title],(err,results)=>{
        if(err){
            res.status(500).send('con error');
        }
        res.status(200).send(results);
    });
});

















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

