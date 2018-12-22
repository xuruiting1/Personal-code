var express = require('express');
var app = express();
var mysql = require('mysql');
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'fresh'
})

con.connect();
app.all('*', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

//查询
function connect(sql){
    con.query(sql, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        return result;
    });
}
//登录验证
function compare() {
    var options = [];
    var sql = "select * from register where account=? and password=?";
    app.post('/api/login', function (req, res) {
        req.on('data', (data) => {
            data = JSON.parse(data);
            options = [];
            for (var i in data) {
                options.push(data[i]);
            }
            con.query(sql, [...options], function (err, result) {
                if (err) {
                    res.send("ERROR"+err);
                }
                console.log(result);
                res.send(result);                
            });
        });
    })
}
//注册
var register = 'insert into register(account,password) values(?,?)';
post(register, "register");
//登录验证
compare();
//关注表
var attention="insert into attention(uid,aid) values(?,?)";
post(attention,"attention");
//取消关注
var noatten="delete from attention where uid=? and aid=?";
post(noatten,"noattention");
//收藏
var collection="insert into collection(uid,did,cid) values(?,?,?)";
post(collection,"collection");
var nocollec="delete from collection where uid=? and did=? and cid=?";
post(nocollec,"nocollec");

// 动态
var contact = "select * from dynamic"
get(contact, "contact");
//动态详情
var className = "select * from classes";
get(className, "contactail");

//post
function post(sql, url) {
    var options = [];
    app.post('/api/' + url, function (req, res) {
        req.on('data', (data) => {
            data = JSON.parse(data);
            console.log(data);
            options = [];
            for (var i in data) {
                options.push(data[i]);
            }
            // console.log(options);
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

app.listen(8080);
