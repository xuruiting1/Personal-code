var express = require('express');
var db = require('./database');
var app = express();

const fs = require('fs');
//解析post请求的body 
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.all('*', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

//post
function post(sql, url) {
    var options = [];
    app.post('/api/' + url, function (req, res) {
        console.log(req.body);
        var body = req.body;
        options = [];
        for (var i in body) {
            options.push(body[i]);
        }
        // console.log(options);
        db.query(sql, [...options], function (err, result) {
            if (err) {
                res.send(err);
            }
            console.log(result);
        });
    });

}
// get
function get(sql, path) {
    app.get('/api/' + path, function (req, res) {
        db.query(sql, function (err, result) {
            if (err) {
                console.error(err);
            }
            //console.log(result);
            res.send(result);
        })
    })
}
//动态上传图片
app.post('/api/contact/release/dynamic', (req, res) => {
    var file = req.body.dynamic;
    var name = req.body.name;
    console.log(name);
    var buf = new Buffer(file, 'base64');
    // log(buf);
    fs.writeFile('../project/src/assets/imgs/download/' + name, buf, err => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            console.log("save success");
            res.send("save success");
        }
    });
});
//发布动态
post('insert into dynamic(uid,title,content,imgs,cid,time) values(?,?,?,?,?,?)', 'contact/release');

// 动态
get("select * from dynamic order by did desc", "contact");
//动态详情
get("select * from classes", "contact/contactail");
//用户信息
get("select * from user_info", "contact/user_info");

//评论
var assess = "insert into assess(did,uid,time,content) values(?,?,?,?)";
post(assess, 'contact/contactail/assess');
//传评论
var assess2 = 'select * from assess order by sid desc';
get(assess2, "contact/contactail/assess");
//查询
function select(sql, url) {
    var options = [];
    app.post('/api/' + url, function (req, res) {
        var body = req.body;
        options = [];
        for (var i in body) {
            options.push(body[i]);
        }
        db.query(sql, [...options], function (err, result) {
            if (err) {
                res.send(err);
            }
            console.log(result);
            res.send(result);
        });
    })
}
//查询是否关注
var isAtten = "select * from attention where uid=? and aid=?";
select(isAtten, "contact/contactail/isAtten");
//查询是否收藏
var isCollec = "select * from collection where uid=? and did=?";
select(isCollec, "contact/contactail/isCollec");


//关注表
post("insert into attention(uid,aid) values(?,?)", "contact/contactail/attention");
//取消关注
post("delete from attention where uid=? and aid=?", "contact/contactail/noattention");
//收藏
post("insert into collection(uid,did) values(?,?)", "contact/contactail/collection");
//取消收藏
post("delete from collection where uid=? and did=?", "contact/contactail/nocollec");



var uid;//获取用户id
app.post('/api', (req, res) => {
    req.on('data', (data) => {
        uid = JSON.parse(data.toString('utf8')).uid;
    });
});

//登录
app.post('/api/login', function (req, res) {
    var chunk = '';
    const sql = 'select * from register where account=?';
    req.on('data', (data) => {
        chunk = JSON.parse(data);
        db.query(sql, [chunk.tel], (err, result) => {
            if (err) {
                console.error("Error:", err);
                res.status(500).end('DB ERROR!');
            } else {
                // console.log(result);
                res.send(result);
            }
        });
    });
});
function status(url, sql) {
    app.post(url, function (req, res) {
        req.on('data', (data) => {
            data = JSON.parse(data).uid;
            db.query(sql, [data], function (err, result) {
                if (err) {
                    console.error("Error:", err);
                    res.status(500).end('DB ERROR!');
                }
            });
        })
    });
}
status('/api/login/status', "update register set loginStatus='1' where uid=?");
status('/api/login/statusout', "update register set loginStatus='0' where uid=?")
app.post('/api/login/count', function (req, res) {
    req.on('data', (data) => {
        uid = JSON.parse(data).uid;
        db.query('select * from register where uid=?', [uid], function (err, result) {
            if (err) { res.status(500).send('DB ERROR!'); }
            else {
                count = result[0].loginCount;
                console.log(count);
                if (count == 0) {
                    console.log('count:', count);
                    res.send('0');
                }
                db.query('update register set loginCount=? where uid=?', [count + 1, uid], function (err, result) {
                    if (err) {
                        res.status(500).end('DB ERROR!');
                    }
                });
            }
        });
    })
});

//注册
app.post('/api/register', function (req, res) {
    req.on('data', (data) => {
        data = JSON.parse(data);
        db.query('select * from register where account=?', [data.tel], function (err, result) {
            if (err) {
                res.status(500).end('DB ERROR!');
            } if (result[0]) {
                res.end('0');
            } else {
                db.query('insert into register(account,password) values(?,?)', [data.tel, data.pwd], (err, result) => {
                    if (err) {
                        res.status(500).end('DB ERROR!');
                    }
                    db.query('select * from register where account=?', [data.tel], (err, result) => {
                        if (err) {
                            res.status(500).end('DB ERROR!');
                        } else {
                            console.log(result);
                            uid = result[0].uid;
                            db.query('insert into user_info(uid,avatar,bid) values(?,"moren.jpg",1)', [uid], (err, result) => {
                                if (err) {
                                    res.status(500).end('DB ERROR!');
                                }
                                console.log(result);
                            });
                        }
                    });
                });
            }
        });
    });
});
//Home
//首页获取各分类推文的函数
function getPassage(url, sql) {
    app.get('/api/' + url, (req, res) => {
        if (!uid) {  //uid为空  未知体质状况  uid位默认平和质用户
            db.query(sql, [1], (err, results) => {  //此处要求数据库必须有一个默认系统创建的用户（平和质） uid=1并且bid=1
                if (err) {
                    // console.log(err.message);
                    res.status(500).send('DB error');
                }
                res.status(200).send(results);
            });
        }
        else {  // bid非空  已知体质状况        发发发
            db.query(sql, [uid], (err, results) => {
                if (err) {
                    // console.log(err.message);
                    res.status(500).send('DB error');
                }
                res.status(200).send(results);
            });
        }
    })
}
//推荐
getPassage('tuijian', 'select * from recommend where bid in (select bid from user_info where uid=?)');
//健身方面
getPassage('jianshen', 'select * from recommend where cid=1 and bid in (select bid from user_info where uid=?)');
//饮食方面
getPassage('yinshi', 'select * from recommend where cid=2 and bid in (select bid from user_info where uid=?)');
//理疗方面
getPassage('liliao', 'select * from recommend where cid=3 and bid in (select bid from user_info where uid=?)')
// 宜忌
getPassage('yiji', 'select * from shoulds where bid in (select bid from user_info where uid=?)');



//Hometail
var rid;
app.post('/api/hometail', (req, res) => {
    req.on('data', (data) => {
        rid = JSON.parse(data.toString('utf8')).rid;
        const sql = 'select * from recommend where rid=?';
        db.query(sql, [rid], (err, results) => {
            if (err) {
                res.status(500).send('DB error');
            }
            res.status(200).send(results);
        });
    });
});


//推文收藏
var rid;//推文id
app.post('/api/hometail/collect', (req, res) => {
    if (req.url === "/api/hometail/collect" && req.method === "POST") {
        req.on('data', (data) => {
            rid = JSON.parse(data.toString('utf8')).rid;
            uid = JSON.parse(data.toString('utf8')).uid;
            const sql = 'insert into collectionR(uid,rid) values(?,?)';
            db.query(sql, [uid, rid], (err, results) => {
                if (err) {
                    res.status(500).send('DB error');
                }
            });
        });
    }
});
//取消收藏
app.post('/api/hometail/uncollect', (req, res) => {
    if (req.url === '/api/hometail/uncollect' && req.method === "POST") {
        req.on('data', data => {
            rid = JSON.parse(data.toString('utf8')).rid;
            uid = JSON.parse(data.toString('utf8')).uid;
            const sql = 'delete from collectionr where uid=? and rid=?';
            db.query(sql, [uid, rid], (err, results) => {
                if (err) {
                    res.status(500).send('DB error');
                }
            });
        });
    }
});

// 查看是否已经收藏
app.post('/api/hometail/iscollect', (req, res) => {
    if (req.url === '/api/hometail/iscollect' && req.method === 'POST') {
        req.on('data', data => {
            rid = JSON.parse(data.toString('utf8')).rid;
            uid = JSON.parse(data.toString('utf8')).uid;
            const sql = 'select * from collectionr where uid=? and rid=?';
            db.query(sql, [uid, rid], (err, results) => {
                if (err) {
                    rea.status(500).send('DB error');
                }
                res.status(200).send(results);
            });
        });
    }
});




//计划页
app.get('/api/plan', (req, res) => {
    const sql = 'select * from plan';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send('DB error');
        }
        res.status(200).send(results);
    });
});

var pid;
app.post('/api/plan/saveplan', (req, res) => {
    if (req.url === '/api/plan/saveplan' && req.method === 'POST') {
        req.on('data', (data) => {
            pid = JSON.parse(data.toString('utf8')).pid;
            uid = JSON.parse(data.toString('utf8')).uid;
            const sql = 'insert into userplan(uid,pid) values(?,?)';
            db.query(sql, [uid, pid], (err, results) => {
                if (err) {
                    res.status(500).send('DB error');
                }
            })
        });
    }
});
app.post('/api/plan/delplan', (req, res) => {
    if (req.url === "/api/plan/delplan" && req.method === "POST") {
        req.on('data', (data) => {
            pid = JSON.parse(data.toString('utf8')).pid;
            const sql = 'delete from userplan where uid=? and pid=?';
            db.query(sql, [uid, pid], (err, results) => {
                if (err) {
                    res.status(500).send('DB error');
                }
            });
        });
    }
});

app.get('/api/plan/userplan', (req, res) => {
    if (uid) {
        console.log(uid);
        const sql = "select * from plan where pid in (select pid from userplan where uid=?)";
        db.query(sql, [uid], (err, results) => {
            if (err) {
                res.status(500).send('DB error');
            }
            console.log(results);
            res.status(200).send(results);
        });
    }
});

//我的页面

function mePage(url, sql) {
    app.post('/api/' + url, function (req, res) {
        req.on('data', (data) => {
            uid = JSON.parse(data).uid;
            db.query(sql, [uid], function (err, result) {
                if (err) { res.status(500).send('DB error'); }
                else { res.status(200).send(result); }
                // console.log(result);
            });
        });

    });
}

mePage('me', 'select * from user_info where uid=?');
//个人资料
mePage('usertail', 'select * from user_info where uid=?');
mePage('usertail/tel', 'select * from register where uid=?');

//个人资料
app.post('/api/usertail/save', function (req, res) {
    req.on('data', data => {
        data = JSON.parse(data);
        uid = data.uid;
        const tail = 'update user_info set avatar=?,nickname=?,signature=?,sex=?,birth=?,city=? where uid=' + uid;
        db.query(tail, [data.avatar, data.nickname, data.signature, data.sex, data.birth, data.city], (err, result) => {
            if (err) { res.status(500).send('DB error'); }
            else { res.status(200).send(result); }
        });
    });
});
//我的收藏
mePage('mylikesd', 'select dynamic.* from dynamic,collection where dynamic.did = collection.did and collection.uid=?');
mePage('mylikesr', 'select recommend.* from recommend,collectionr where recommend.rid = collectionr.rid and collectionr.uid=?');

//我的动态
mePage('mydynamic', 'select * from dynamic where uid=?');
//用户信息
mePage('mydynamic/user_info', 'select * from user_info where uid=?');
//我的动态详情
app.post('/api/mydynamictail', (req, res) => {
    req.on('data', (data) => {
        did = JSON.parse(data.toString('utf8')).did;
        console.log(did);
        const sql = 'select * from dynamic where did=?';
        db.query(sql, [did], (err, results) => {
            if (err) {
                res.status(500).send('DB error');
            }
            res.status(200).send(results);
        });
    });
});
app.post('/api/mydynamictail/user_info', (req, res) => {
    req.on('data', (data) => {
        uid = JSON.parse(data.toString('utf8')).uid;
        const sql = 'select * from user_info where uid=?';
        db.query(sql, [uid], (err, results) => {
            if (err) {
                res.status(500).send('DB error');
            }
            res.status(200).send(results);
        });
    });
});
//关注表
post("insert into attention(uid,aid) values(?,?)", "mydynamictail/attention");
//取消关注
post("delete from attention where uid=? and aid=?", "mydynamictail/noattention");
//收藏
post("insert into collection(uid,did) values(?,?)", "mydynamictail/collection");
//取消收藏
post("delete from collection where uid=? and did=?", "mydynamictail/nocollec");
//发布评论
post("insert into assess(did,uid,time,content) values(?,?,?,?)", "/mydynamictail/assess");

//我的关注
app.post('/api/myattention', (req, res) => {
    req.on('data', (data) => {
        uid = JSON.parse(data.toString('utf8')).uid;
        const sql = 'select * from user_info where uid in (select aid from attention where uid = ?)';
        db.query(sql, [uid], (err, results) => {
            if (err) {
                res.status(500).send('DB error');
            }
            res.status(200).send(results);
        });
    });
});

//关注
post("insert into attention(uid,aid) values(?,?)", "attention");
//取消关注
post("delete from attention where uid=? and aid=?", "noattention");

//我的粉丝
app.post('/api/myfans', (req, res) => {
    req.on('data', (data) => {
        uid = JSON.parse(data.toString('utf8')).uid;
        const sql = 'select * from user_info where uid in (select uid from attention where aid = ?)';
        db.query(sql, [uid], (err, results) => {
            if (err) {
                res.status(500).send('DB error');
            }
            res.status(200).send(results);
        });
    });
});



//bodytest页面后台代码
var selectsql = 'select * from question';
//查询题库中所有的问题
getTest(selectsql, 'question');
// get方法
function getTest(sql, path) {
    db.query(sql, function (err, result) {
        if (err) {
            console.error(err);
        }
        app.get('/api/' + path, function (req, res) {
            //转换成JSON String格式
            console.log(result);
            res.send(result);
        })
    })
}

//个人测试分数的添加和更新两种操作
var insertsql = 'insert into scores(uid,pinghe,qixu,yangxu,yinxu,tanshi,shire,xueyu,qiyu,tebing) values(?,?,?,?,?,?,?,?,?,?)'
//如果没测试，测试后更新scores数据库的分数
post(insertsql, 'question');

//测试过后更新数据库的分数
var update = 'update scores set uid=?,pinghe=?,qixu=?,yangxu=?,yinxu=?,tanshi=?,shire=?,xueyu=?,qiyu=?,tebing=? where uid=?'
app.post('/api/question2', function (req, res) {
    var options = [];
    var body = req.body;
    uid = body.uid;
    console.log(uid);
    console.log(body);
    for (var i in body) {
        options.push(body[i]);
        console.log(options);
    }
    options.push(uid);
    // console.log(options);
    db.query(update, [...options], function (err, result) {
        if (err) {
            res.send(err);
        }
        console.log(options);
    });

});

//查询分数进行计算主体质和倾向的体质
app.post('/api/flag', (req, res) => {
    var body = req.body;
    uid = body.uid;
    //    console.log(uid);
    const sql = 'select * from scores where uid=?';
    db.query(sql, [uid], (err, results) => {
        if (err) {
            res.status(500).send('error');
        }
        res.status(200).send(results);
    });
});

//计算后更新用户信息表的主体质id
app.post('/api/question/main', (req, res) => {
    var options = [];
    var body = req.body;
    console.log(body);
    for (var i in body) {
        options.push(body[i]);
        console.log(options);
    }
    var physique = 'update user_info set bid=? where uid=?';
    db.query(physique, [...options], function (err, result) {
        if (err) {
            res.send(err);
        }
        console.log(options);
        res.send(result);
    });

});

//请求用户表的体质:/api/body/main
app.post('/api/body/main', (req, res) => {
    var options = [];
    var body = req.body;
    uid = body.uid;
    var selectphysique = 'select bid from user_info where uid=?';
    db.query(selectphysique, [uid], function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.send(result);
            console.log(options);
        }
    });

});

//查询body表中所有的体质报告中调养方法  /api/body
app.get('/api/body', (req, res) => {
    const selectbody = 'select * from body';
    db.query(selectbody, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.send(result);
            console.log(result);
        }
    });
});


app.listen(8080);
