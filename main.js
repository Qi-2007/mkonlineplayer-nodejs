const crypto = require('crypto');
var kwdes = require('./kwdes.js');
//var fm = require('./freemusic.js');
const CryptoJS = require("crypto-js");
var request = require('request');
var express = require('express');
var app = express();

app.use(express.static('1'))
app.get('/api/', function (req, res) {
    //console.log(req.query)
    res.set('Content-Type','application/json' );
    switch(req.query.types){
        case 'url': 
            switch(req.query.source){
                case 'netease':
                    wy_url(req, res)
                    break
                case 'kuwo':
                    kw_url(req, res)
                    break
            }
            break;
        case 'playlist':
            wy_playlist(req, res)
            break;
        case 'userlist':
            wy_userlist(req, res)
            break;
        case 'lyric':
            switch(req.query.source){
                case 'netease':
                    wy_lyric(req, res)
                    break
                case 'kuwo':
                    kw_lyric(req, res)
                    break
            }
            break;
        case 'search':
            switch(req.query.source){
                case 'netease':
                    wy_search(req, res)
                    break
                case 'kuwo':
                    kw_search(req, res)
                    break
            }
        break;
    }
});
//咪咕
function migu_url(req, res) {
    var id = req.query.id
    if (id == '' || id == null) {
        res.status = 500
        res.send('Id cannot be empty!');//id为空
    }
    else {
        var url = "http://c.musicapp.migu.cn/MIGUM2.0/v1.0/content/resourceinfo.do?resourceType=2&copyrightId=" + req.query.id;
        request({
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
            },
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var flac = JSON.parse(body).resource
                //判断数据是否为空
                if (flac == '') {
                    flac = 'migu-error'
                }
                //下面是请求成功
                else {
                    flac = flac[0].newRateFormats[2].androidUrl.replace(/ftp:\/\/[^/]+/, 'https://freetyst.nf.migu.cn')
                }
                res.send(flac);//发送
                return
                //end
            }
            //其他情况
            res.status = 500
            res.send('mg-error');
            //end
        });
    }
}
//end


//酷我
function kw_url(req, res) {
    var id = req.query.id
    var br = '2000kflac'//req.query.br
    if (id == '' || id == null) {
        res.status = 500
        res.send('Id cannot be empty!');
        return
    }
    else {
	//if (br == '' || br == null || br != '320' && br != 'flac') {
	//	var br = '128'
	//	var url = 'https://antiserver.kuwo.cn/anti.s?type=convert_url&format=mp3&rid='+id;
	//}
    //    else {
        var url = 'http://nmobi.kuwo.cn/mobi.s?f=kuwo&q=' + kwdes.encryptQuery('user=f5d7c0872d4e0d45&android_id=f5d7c0872d4e0d45&prod=kwplayer_ar_5.1.0.0&corp=kuwo&newver=3&vipver=5.1.0.0&source=kwplayer_ar_5.1.0.0_B_jiakong_vh.apk&p2p=1&q36=44dc3941c5ac470c0667be0910001bc1670e&loginUid=459359271&loginSid=0&notrace=0&type=convert_url_with_sign&br=2000kflac&format=flac|mp3|aac&sig=0&priority=bitrate&loginUid=459359271&network=4G&loginSid=0&localUid=-&rid='+ req.query.id);
	//}
    console.log(url)
        request({
            url: url,
            headers: {
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 10; Redmi note 5A MIUI/21.3.0) Edg/94.0.4606.61',
            },
        }, function (error, response, body) {
			//console.log(body)
            if (!error && response.statusCode == 200) {
				//if (br != '128'){ var flac = body}//.match(/(?<=url=).+(?=(\r\n))/)[0]; }
				//if (parseInt(body.ma
				
				if(req.query.type=='https'){
					body=body.replace(/http:\/\/(.*?).sycdn/,'https://'+body.match(/http:\/\/(.*?).sycdn/)[1]+'-sycdn')
				}
                let url = JSON.parse(body).data.url
                console.log(url)
				res.send(req.query.callback+`({"url": "${url}"})`)
				//console.log(body)
				
				//let data=JSON.parse(body)
				
				
				//var flac = host+'.sycdn.kuwo.cn/'+body.match(/url=(.*)/)[1]
                //else{ flac = body}
                //if (flac == '') {
                //    flac = body//'kw-error'
                //}
                return
            }
            res.status = 500
            res.send(body);//其他情况
            return
        });
    }
}
//search
function kw_search(req, res) {
    request({
        method: "GET",
        url: "http://search.kuwo.cn/r.s?pn=0&rn=10&rformat=json&vipver=1&mobi=1&encoding=utf8&ft=music&all="+encodeURI(req.query.name),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586',
        },
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let data=JSON.parse(body).abslist
            let count = 0;
            let arr=[];
            for(let key of data) {
                if (key.web_albumpic_short==''){
                    pic='https://img1.kuwo.cn/star/starheads/'+key.web_artistpic_short
                }else{
                    pic='https://img2.kuwo.cn/star/albumcover/'+key.web_albumpic_short
                }
                arr[count]={
                    'id': key.DC_TARGETID,
                    'name': key.NAME,
                    'artist': [key.ARTIST],
                    'album': key.ALBUM,
                    'pic': pic,
                    'url_id': key.DC_TARGETID,
                    'lyric_id': key.DC_TARGETID,
                    'source': 'kuwo'
                }
                count++;
            }
            res.send(req.query.callback+`(${JSON.stringify(arr)})`)
        }
    })
}
//lyric
function kw_lyric(req, res) {
    request({
        method: "GET",
        url: "https://m.kuwo.cn/newh5/singles/songinfoandlrc?musicId="+req.query.id,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586',
        },
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let data=JSON.parse(body).data.lrclist
            let count = 1;
            let lrc='';
            for(let key of data) {
                if(count < data.length && key.time==data[count].time) key.time-=1
                //console.log(count,data.length)
                lrc+=s2m(key.time)+' '+key.lineLyric+'\n'
                count++;
            }
            let temp={
                'lyric': lrc,
            }
            res.send(req.query.callback+`(${JSON.stringify(temp)})`)
        }
    })
}
//网易
function wy_url(req, res) {
//    var keyword = req.query.keyword
//	var type = req.query.type
//    if (keyword == '' || keyword == null) {
//        res.status = 500
//        res.send('Keyword cannot be empty!');
//    }
//    else {
//		if (type == '163') {
//			type = 'YQD'
//		}else{
//			type = 'YQB'
//		}
        var csKey = encodeURIComponent("V/Pq1EGT9qm7eE+DjdGXTjEVF3bEHGXn0F+KkUqDEFmJaQthxrFu5eS3ngmeRtZrGu8hBUIjLL23CrH6zugAlsVIYl7jly2uHxddMlb5szQcoUWVFSQrD4sWjHU3TrSB4zYLar4Za6KDNmA8Ng+mUIERsk0XmMWwQDxoPyZwUxM=")
        var params =encodeURIComponent(AES_Encrypt(`{"id": ${req.query.id}, "q": "flac", "src": "wyy", "play": true, "filename": ""}`))
        data=`params=${params}&sec_key=${csKey}`
        console.log(data)
		request({
			method: "POST",
            timeout: 2000,
			url: "https://music.y444.cn/api/v1/jx/v4/",
			body: data,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36 Edg/103.0.1264.77',
                'Referer': 'https://music.y444.cn/api/v1/jx/v4/',
                'Content-Type': 'application/x-www-form-urlencoded'
			},
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
                var data=AES_Decrypt(JSON.parse(body).data)
                var url=JSON.parse(data).url.remote_https
				res.send(req.query.callback+`({"url": "${url}"})`)
			}else{res.send('502 Time Out')}
		})
//    }
}
//pic
function wy_pic(id) {
    id = id.toString().trim();
    const key = '3go8&$8*3*3h0k(2)2';
    const string = Array.from(Array(id.length).keys())
        .map((index) =>
            String.fromCharCode(
                id.charCodeAt(index) ^
                    key.charCodeAt(index % key.length)
            )
        )
        .join('');
    const result = crypto
        .createHash('md5')
        .update(string)
        .digest('base64')
        .replace(/\//g, '_')
        .replace(/\+/g, '-');
    return `http://p1.music.126.net/${result}/${id}.jpg`;
}
//playlist
function wy_playlist(req, res) {
    request({
        method: "POST",
        url: "https://music.163.com/api/v3/playlist/detail",
        body: 'n=10000000&id='+req.query.id,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586',
        },
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            json=JSON.parse(body)
            let trackIds = json.playlist.trackIds

            let idsData = {
                c:
                  '[' +
                  trackIds
                    .slice(0, 0 + Infinity)
                    .map((item) => '{"id":' + item.id + '}')
                    .join(',') +
                  ']',
            }

            let data=weapi(idsData)
            request({
                method: "POST",
                url: `https://music.163.com/weapi/v3/song/detail`,
                body: new URLSearchParams(data).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586',
                },
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    songs=JSON.parse(body).songs
                    json.playlist.tracks=songs
                    res.send(req.query.callback+`(${JSON.stringify(json)})`)
            }
            })
        }
    })
}
//userlist
function wy_userlist(req, res) {
    request({
        method: "POST",
        url: "https://music.163.com/api/user/playlist",
        body: 'limit=30&offset=0&uid='+req.query.uid,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586',
        },
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(req.query.callback+`(${body})`)
        }
    })
}
//lyric
function wy_lyric(req, res) {
    console.log('id='+req.query.id)
    request({
        method: "POST",
        url: "https://music.163.com/api/song/lyric?_nmclfl=1",
        body: 'tv=-1&lv=-1&rv=-1&kv=-1&id='+req.query.id,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586',
        },
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let data=JSON.parse(body)
            let temp={
                'lyric': data.lrc.lyric,
                'tlyric': data.tlyric.lyric
            }
            res.send(req.query.callback+`(${JSON.stringify(temp)})`)
        }
    })
}
//search
function wy_search(req, res) {
    request({
        method: "POST",
        url: "http://music.163.com/api/search/get/web",
        body: 'type=1&limit=10&offset=0&s='+req.query.name,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586',
        },
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body=body.replace(/"picId":(.*?),/g,'"picId":"$1",')

            console.log(body)
            let data=JSON.parse(body).result.songs
            let count = 0;
            let arr=[];
            for(let key of data) {
                let artist
                let name=[]
                let i=0
                for(let a of key.artists) {
                    name[i]=a.name
                    i++
                }
                artist = name.join('、')
                arr[count]={
                    'id': key.id,
                    'name': key.name,
                    'artist': [artist],
                    'album': key.album.name,
                    'pic': wy_pic(key.album.picId),
                    'pic_id': key.album.picId,
                    'url_id': key.id,
                    'lyric_id': key.id,
                    'source': 'netease'
                }
                count++;
            }
            res.send(req.query.callback+`(${JSON.stringify(arr)})`)
        }
    })
}
//y444
var y444_iv = CryptoJS.enc.Utf8.parse("0102030405060708");
function AES_Encrypt(word) {
    let key = CryptoJS.enc.Utf8.parse('X3SQ5MtNbYSjRDAH'); 
    var srcs = CryptoJS.enc.Utf8.parse(word);
    var encrypted = CryptoJS.AES.encrypt(srcs, key, {
        iv: y444_iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}
function AES_Decrypt(word) {
    let key = CryptoJS.enc.Utf8.parse('2wVGQU6CMFpZzMQX');
    var decrypt = CryptoJS.AES.decrypt(word, key, {
        iv: y444_iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypt.toString(CryptoJS.enc.Utf8);
}
//lyric
function s2m(a){
    s=Math.floor(a%60)
    m=Math.floor((a-s)/60)
    if(m<10) m='0'+m
    if(s<10) s='0'+s
    return `[${m}:${s}]`
}


//'weapi'
const aesEncrypt = (buffer, mode, key, iv) => {
    const cipher = crypto.createCipheriv('aes-128-' + mode, key, iv)
    return Buffer.concat([cipher.update(buffer), cipher.final()])
}
const rsaEncrypt = (buffer, key) => {
    buffer = Buffer.concat([Buffer.alloc(128 - buffer.length), buffer])
    return crypto.publicEncrypt(
      { key: key, padding: crypto.constants.RSA_NO_PADDING },
      buffer,
    )
}

const weapi_iv = Buffer.from('0102030405060708')
const weapi_presetKey = Buffer.from('0CoJUm6Qyw8W8jud')
const weapi_base62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const weapi_publicKey =
  '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB\n-----END PUBLIC KEY-----'


const weapi = (object) => {
    const text = JSON.stringify(object)
    const secretKey = crypto
      .randomBytes(16)
      .map((n) => weapi_base62.charAt(n % 62).charCodeAt())
    return {
      params: aesEncrypt(
        Buffer.from(
          aesEncrypt(Buffer.from(text), 'cbc', weapi_presetKey, weapi_iv).toString('base64'),
        ),
        'cbc',
        secretKey,
        weapi_iv,
      ).toString('base64'),
      encSecKey: rsaEncrypt(secretKey.reverse(), weapi_publicKey).toString('hex'),
    }
}

app.listen(3000);

