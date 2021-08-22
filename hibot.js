/*
* 원본소스: https://cafe.naver.com/nameyee/14642
*/

const MY_KEY = "336727607"; //봇의 user_id. 
const BOT_NAME = "봇"; //봇의 이름
const admin_name = '마시멜로'; //관리자 이름.
const admin_hash = '1988534416'; //관리자 프로필 해시코드. 채팅방에 "/해시코드"라고 입력해 확인해 볼 수 있음.
const kaan = { //각 방마다의 입퇴장문구.
    /* 
    * 자신의 입맛에 맞게 작성해 주시면 됩니다.
    */ 
    '방1': { //방1
        'in_new':'${name}님 어서오세요!', //입장문구(새로 왔을때)
        'in_old':'${name}님 돌아오신 것을 환영해요!', //입장문구 (다시 돌아왔을 때)
        'out':'${name}님 안녕히 가세요!', //퇴장문구
        'kick':'${name1}님이 {$name2}님을 내보냈습니다.' //내보내졌을 때 문구
    }, 
    
    '방2':{ //방2
        'in_new':'${name}님 공지 필독!', //입장문구 (새로 왔을때)
        'in_old':'${name}님, 들낙 자제해 주세요:)', //입장문구(다시 돌아왔을 때)
        'out':'${name}님이 채팅방을 나가셨습니다.', //퇴장문구
        'kick':'${name2}님이 ${name1}님에 의해 내보내졌습니다.' //내보내졌을 때 문구
    }
    
    /* 예시
    '마시멜로의 카카오톡 봇방':{
        'in_new':'${name}님, 어서오세요!',
        'in_old':'${name}님, 오랜만이에요!',
        'out':'${name}님, 안녕히 가세요!',
        'kick':'${name1}님이 ${name2}님을 내보내셨습니다.'
    }
    */
}

const scriptName = "db";
const Lw = "\u200b".repeat(500);
const fs = FileStream;
const pb="[Bot] ";
const Context = android.content.Context;
const SQLiteDatabase = android.database.sqlite.SQLiteDatabase;
const DatabaseUtils = android.database.DatabaseUtils;
const PowerManager = android.os.PowerManager;
const Base64 = android.util.Base64;
const _Array = java.lang.reflect.Array;
const _Byte = java.lang.Byte;
const _Integer = java.lang.Integer;
const Runtime = java.lang.Runtime;
const _String = java.lang.String;
const Timer = java.util.Timer;
const TimerTask = java.util.TimerTask;
const Cipher = javax.crypto.Cipher;
const IvParameterSpec = javax.crypto.spec.IvParameterSpec;
const PBEKeySpec = javax.crypto.spec.PBEKeySpec;
const SecretKeyFactory = javax.crypto.SecretKeyFactory;
const SecretKeySpec = javax.crypto.spec.SecretKeySpec;
const JSONObject = org.json.JSONObject;
const pathdata = 'sdcard/bot/메시지삭제.txt';
const pathlog = 'sdcard/bot/입퇴장로그.txt';

if(!fs.read(pathdata)) fs.write(pathdata, '{}');
let jsondata = JSON.parse(fs.read(pathdata));   
if(!fs.read(pathlog)) fs.write(pathlog, '{}');
let jsonlog = JSON.parse(fs.read(pathlog));
let pm = Api.getContext().getSystemService(Context.POWER_SERVICE);
let wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "DBBot");
wakeLock.acquire();
let db = null;
let db2 = null;

function getMyKey() {
    try{
        let cursor_getMyKey = db2.rawQuery("SELECT * FROM open_profile", null);
        cursor_getMyKey.moveToFirst();
        let my_data = {};
        my_data['user_id'] = cursor_getMyKey.getString(cursor_getMyKey.getColumnIndex('user_id'));
        my_data['name'] = cursor_getMyKey.getString(cursor_getMyKey.getColumnIndex('nickname'));
        cursor_getMyKey.close();
        return my_data;
    } catch(e) {
        log.e('아무 오픈채팅방에나 들어가신 후 컴파일 해주세요.');
        return null;
    }
}

function chatLog(room_id, num, type) {
    if(room_id==undefined || num==undefined) return '필수 인자값이 누락되었습니다.';
    let chatdata = db.rawQuery("SELECT * FROM chat_logs WHERE chat_id=? ORDER BY created_at DESC LIMIT ?", [room_id, num]);
    chatdata.moveToLast();
    let data = [];
    let column = chatdata.getColumnNames();
    if(!chatdata.moveToFirst()) {
        chatdata.close();
        return [];
    }
    do {
        let obj = {};
        for (let i = 0; i < column.length; i ++) {
            obj[column[i]] = chatdata.getString(i);
            if(column[i] == "v"){
                obj[column[i]] = JSON.parse(chatdata.getString(i));
            }
            if(column[i] == "id"){
                obj[column[i]] = obj[column[i]].toString();
            }
        }
        obj.message = decrypt(obj.user_id, obj.v.enc, obj.message);
        try{
            if(obj.attachment != "{}"){
                if(obj.attachment == null) obj.attachment = {};
                else {let at = decrypt(obj.user_id, obj.v.enc, obj.attachment);
                if(at.includes('src_user').valueOf()){
                    obj.attachment = JSON.parse(at.replace("\"src_userId\":", "\"src_userId\":\"").replace('}', '"}'));
                }else{
                    obj.attachment = JSON.parse(at);
                }
                }
            }
        }catch(e){
            Log.e('chatLog: '+e+' ('+e.lineNumber+')');
            return null;
            // return JSON.stringify(json,null,4)// at.replace("\"src_userId\":", "\"src_userId\":\"").replace('}\n', '"}\n')
        }
        if(type!=undefined) return chattype(obj.type, obj.message, obj.attachment);
        if(obj.type != 0) data.push('['+getUserdata(obj.user_id).name+'] ['+obj.v.c+'] '+chattype(obj.type, obj.message, obj.attachment));
    } while (chatdata.moveToNext());
    chatdata.close();
    return data;
}

function getRoomChatJson(room_id, num, option){
    if(room_id==undefined || num==undefined) return '필수 인자값이 누락되었습니다.';
    let chatdata = db.rawQuery("SELECT * FROM chat_logs WHERE chat_id=? ORDER BY created_at DESC LIMIT ?", [room_id, num]);
    chatdata.moveToLast();
    let data = [];
    let column = chatdata.getColumnNames();
    if(!chatdata.moveToFirst()) {
        chatdata.close();
        return [];
    }
    do {
        let obj = {};
        for (let i = 0; i < column.length; i ++) {
            obj[column[i]] = chatdata.getString(i);
            if(column[i] == "v"){
                obj[column[i]] = JSON.parse(chatdata.getString(i));
            }
            if(column[i] == "id"){
                obj[column[i]] = obj[column[i]].toString();
            }
        }
        obj.message = decrypt(obj.user_id, obj.v.enc, obj.message);
        try{
            if(obj.attachment != "{}"){
                if(obj.attachment == null) obj.attachment = {};
                else {let at = decrypt(obj.user_id, obj.v.enc, obj.attachment);
                if(at.includes('src_user').valueOf()){
                    obj.attachment = JSON.parse(at.replace("\"src_userId\":", "\"src_userId\":\"").replace('}', '"}'));
                }else{
                    obj.attachment = JSON.parse(at);
                }
                }
            }
        }catch(e){
            Log.e('getRoomChatJson: '+e+' ('+e.lineNumber+')');
            return null;
            // return JSON.stringify(json,null,4)// at.replace("\"src_userId\":", "\"src_userId\":\"").replace('}\n', '"}\n')
        }
        data.push(obj);
    } while (chatdata.moveToNext());
    chatdata.close();
    return data;
}

function getRecentChatData(count) {
    try {
        let cursor = db.rawQuery("SELECT * FROM chat_logs", null);
        cursor.moveToLast();
        let data = [];
        let column = cursor.getColumnNames();
        while (count --) {
            let obj = {};
            for (let i = 0; i < column.length; i ++) {
                obj[column[i]] = cursor.getString(i);
                if (column[i] == "v") {
                    obj.v = JSON.parse(obj.v);
                }
            }
            data.push(obj);
            cursor.moveToPrevious();
        }
        cursor.close();
        return data;
    } catch (e) {
        Log.e('getRecentChatData: '+e+' ('+e.lineNumber+')');
        return null;
    }
};

function roomList() {
    let cursor_roomList = db.rawQuery("SELECT * FROM chat_rooms ORDER BY _id", null);
    let column = cursor_roomList.getColumnNames();
    cursor_roomList.moveToFirst();
    if(!cursor_roomList.moveToFirst()) {
        cursor_roomList.close();
        return null;
    }
    let list = {};
    do {
        let obj = {};
        for(let i=0; i<column.length; i++) {
            obj[column[i]] = cursor_roomList.getString(i);
        }
        if(obj['type'] == 'MultiChat' || obj['type'] == 'OM' || obj['type'] == 'DirectChat') {
            let roomName = getRoomName(obj['id']);
            if(roomName) list[roomName.name] = {'name':roomName.name, 'type':obj['type'],'chat_id':obj['id']};
        }
    } while (cursor_roomList.moveToNext());
    cursor_roomList.close();
    return list;
}

function getRoomName(chat_id) {
    try {
        let room_data = {};
        let result = {};
        let cursor_getRoomName = db.rawQuery("SELECT * FROM chat_rooms WHERE id=?", [chat_id]);
        let columns = cursor_getRoomName.getColumnNames();
        if(!cursor_getRoomName.moveToFirst()) {
            cursor_getRoomName.close();
            return null;
        }
        cursor_getRoomName.moveToFirst();
        for (let i = 0; i < columns.length; i ++) {
            room_data[columns[i]] = cursor_getRoomName.getString(i);
        }    
        cursor_getRoomName.close();
        result['moim_meta'] = room_data['moim_meta'];
        result['chat_id'] = chat_id;
        if(room_data['private_meta'] == null) {
            if(room_data['type'] == 'DirectChat') {
                let user_id = room_data['members'].replace('[', '').replace(']','');
                result['name'] = getUserdata(user_id).name;
                result['type'] = room_data['type'];
                return result;
            } else if(room_data['type'] == "OM") {
                if (room_data['link_id']) {
                    let openchat_data = {};
                    let cursor2 = db2.rawQuery("SELECT * FROM open_link WHERE id=?",[link_id]);
                    let column2 = cursor2.getColumnNames();
                    cursor2.moveToFirst();
                    for (let i = 0; i < column2.length; i ++) {
                        openchat_data[column2[i]] = cursor2.getString(i);
                    }    
                    cursor2.close();
                    result['name'] = openchat_data['name'];
                    result['host_id'] = openchat_data['user_id'];
                    result['url'] = openchat_data['url'];
                    return result;
                } else return null;
            } else return null;
        } else {
            result['name'] = JSON.parse(room_data['private_meta'])['name'];
            result['type'] = room_data['type'];
            return result;
        }
    } catch (e) {
        Log.e('getRoomName: '+e+' ('+e.lineNumber+')');
        return null;
    }
};

function getUserdata(id) {
    if(id == MY_KEY) return {'name':BOT_NAME};
    let userdata = db2.rawQuery("SELECT * FROM friends WHERE id=?", [id]);
    let keys = userdata.getColumnNames();
    userdata.moveToNext();
    let data = {};
    for (let i = 0; i < keys.length; i ++) {
        data[keys[i]] = userdata.getString(i);
    }
    try{
        data.v = JSON.parse(decrypt(MY_KEY, data.enc, data.v));
    }catch(e){
        data.v = {};
    }
    let finalData = {};
    finalData.name = decrypt(MY_KEY, data.enc, data.name);
    try{
        finalData.profile_image_url = decrypt(MY_KEY, data.enc, data.original_profile_image_url);
        finalData.status_message = decrypt(MY_KEY, data.enc, data.status_message);
        finalData.created_at = new Date(Number(data.created_at)).toLocaleString();
        finalData.id = data.id;
        finalData.nick_name = data.nick_name;
        data.board_v = JSON.parse(decrypt(MY_KEY, data.enc, data.board_v));
        finalData.background_image_url = data.board_v.originalBackgroundImageUrl;
        finalData.animated_profile_image_url = data.board_v.originalAnimatedProfileImageUrl;
        userdata.close();
    } catch(e) {}
    return finalData;
}

function getAllusers(chat_id) {
    try {
        if(!initializeDB()) initializeDB();
        let cursor_getAllusers = db2.rawQuery("SELECT * FROM friends", null);
        cursor_getAllusers.moveToFirst();
        if(!cursor_getAllusers.moveToFirst()) {
            cursor_getAllusers.close();
            return null;
         }        
        let data = {};
        do {
            data[cursor_getAllusers.getString(cursor_getAllusers.getColumnIndex('id'))] = cursor_getAllusers.getString(cursor_getAllusers.getColumnIndex('name'));
        } while (cursor_getAllusers.moveToNext());
        cursor_getAllusers.close();
        let allids = getAllids(chat_id);
        if(allids == null) return null;
        let result = {};
        for(let i=0;i<allids.length;i++) {
            if(data[allids[i]] != undefined) {
                result[allids[i]] = decrypt(MY_KEY,29,data[allids[i]]);
                delete data[allids[i]];
            } else continue;
        }
        return result;      
    }  catch (e) {
        Log.e('getAllusers: '+e+' ('+e.lineNumber+')');
        return null;
    }
}

function getAllids(chat_id) {
    try {
        let list = "";
        let cursor_getAllids = db.rawQuery("SELECT members FROM chat_rooms WHERE id=?", [chat_id]);
        cursor_getAllids.moveToNext();
        list = cursor_getAllids.getString(0);
        cursor_getAllids.close();
        list = list.replace("[", '').replace("]", '');
        let array = [];
        for(let i = 0; i<list.split(',').length;i++) array.push(list.split(',')[i]);
        return array.sort();
    }  catch (e) {
        Log.e('getAllids: '+e+' ('+e.lineNumber+')');
        return null;
    }
};

function chattype(type, message, att){
    /* 참고: https://cafe.naver.com/nameyee/25885 */
    try{
        if(att == null) att = {};   
        type = Number(type);
        if(type > 16380) type -= 16384;
        
        switch(Number(type)) {
            case 0: //입퇴장, 가리기 등
                message = JSON.parse(message);
                switch(Number(message.feedType)) {
                    case 2: //퇴장
                        return message.nickName+'님이 나갔습니다.';

                    case 4: //입장
                        return message.nickName+'님이 들어왔습니다.';

                    case 6: //내보내기
                        return message.nickName+'님을 내보냈습니다.';
                    
                    default: 
                        return null;
                } 

            case 1: //일반 메시지
                if(att.path == undefined){ // 500자 미만
                if( message != undefined) return '\n'+message;    
                } else return '\n'+org.jsoup.Jsoup.connect('http://dn-m.talk.kakao.com'+att.path).ignoreContentType(true).get().text();              
            
            case 2: // 사진 한 장
                return '[[사진]]\n'+att.url;
            
            case 3: // 동영상
                return '[[동영상]]\n'+att.url;        
            
            case 4: //연락처
                return '[[연락처]]\n'+att.name+', '+att.url;

            case 5: // 음성메시지
                return '[[음성메시지]]\n'+att.url;
                
            case 6: //이모티콘
                return '[[이모티콘]]\nhttps://item.kakaocdn.net/dw/'+att.path.replace('webp', "png");

            case 12: //이모티콘
                return "[[이모티콘]]\nhttps://item.kakaocdn.net/dw/"+att.path.replace('webp', 'png').replace('emot', 'thum');
                                
            case 14: //투표
                return "[[투표]]\nhttp://kaan.dothome.co.kr/redirect_close.php?adress="+att.os[1].url;

            case 17: //카카오톡 프로필
                return '[[프로필]]\n'+att.nickName;
                
            case 18: //파일
                return '[[파일]]\n'+att.url;
                
            case 20: //이모티콘
                return "[[이모티콘]]\nhttps://item.kakaocdn.net/dw/"+att.path.replace('webp', 'png').replace('emot', 'thum');
                
            case 23: // #검색
                return message;

            case 24: //공지
                return '\n'+message;
                
            case 26: //답장
                let to = getUserdata(att["src_userId"]).name;
                let pre_message = att.src_message;
                if(to && pre_message) return '\n[[' + getUserdata(att["src_userId"]).name + "] \""+att.src_message + "\" 에 답장]] \n\n메시지: "+message;
                else return '[[답장]]\n메시지: '+message;

            case 27: // 묶음사진
                return '[[묶음사진]]\n'+att.imageUrls.join('\n\n');
                
            case 51: //보이스톡
                if(att.type == 'cinvite') return '\n📞 보이스톡해요';
                else if(att.type == 'canceled') return '\n📞 보이스톡 취소';
                else if(att.type == 'bye') return '\n📞 보이스톡 종료';
            
            case 97: //투표 등록
                return '[[투표]]\nhttp://kaan.dothome.co.kr/redirect_close.php?adress='+att.os[1].url;
                
            case 98: // 공지, 투표 공유
                return '[[공유]]\nhttp://kaan.dothome.co.kr/redirect_close.php?adress='+att.os[1].url;

            default:
                return message+' (type: '+type+')';
        }      
        
    }catch(e){
        Log.e('chattype: '+e+' ('+e.lineNumber+')');
        return null;
    }
}

function now() {
    return new Date().getFullYear()+'-'+(new Date().getMonth()+1)+'-'+new Date().getDate()+' '+new Date().getHours()+':'+new Date().getMinutes();
}

DatabaseWatcher.prototype = {
    start: function () {
        if (this.looper == null) {
        this.looper = new Timer();
        this.looper.scheduleAtFixedRate(new TimerTask({
            run: function () {
            try {
                if (initializeDB()) {
                let count = DatabaseUtils.queryNumEntries(db, "chat_logs", null);
                if (this.pre == null) {
                    this.pre = count;
                } else {
                    let change = count - this.pre;
                    this.pre = count;
                    if (change > 0) {
                    let stack = getRecentChatData(change);
                    while (stack.length > 0) {
                        let obj = stack.pop();
                        obj.message = decrypt(obj.user_id, obj.v.enc, obj.message);
                        if(obj.attachment != "{}"){
                            if(obj.attachment == null) obj.attachment = {};
                            else {
                                let at = decrypt(obj.user_id, obj.v.enc, obj.attachment);
                                if(at.includes('src_user').valueOf()){
                                    obj.attachment = JSON.parse(at.replace("\"src_userId\":", "\"src_userId\":\"").replace('}', '"}'));
                                }else{
                                    obj.attachment = JSON.parse(at);
                                }
                            }
                        }
                        let room_data = getRoomName(obj.chat_id);
                        if(room_data == null) continue;
                        let room = room_data.name;
                        let type = room_data.type;
                        if(room != null) {
                            if(jsondata[room] == undefined) jsondata[room] = {'입퇴장감지':true, '삭제감지':true};
                            if(type == "OM" && jsonlog[room] == undefined) jsonlog[room] = {};
                            let message;
                            switch(obj.v.origin) {
                                case 'NEWMEM': //입장
                                
                                    message = JSON.parse(obj.message);
                                    if(type == "OM") { //만약 오픈채팅방이라면
                                        if(jsonlog[room][obj.user_id] == undefined) jsonlog[room][obj.user_id] = [];
                                        jsonlog[room][obj.user_id].push('['+now()+'] '+message.members[0].nickName+" 닉네임으로 입장");
                                        if(jsonlog[room][obj.user_id].length > 1) { //들낙
                                            if(kaan[room]!=undefined) Api.replyRoom(room, kaan[room]['in_old'].replace('${name}', message.members[0].nickName)+Lw+'\n\n입퇴장기록:\n'+jsonlog[room][obj.user_id].join('\n\n'));
                                            else Api.replyRoom(room, message.members[0].nickName+'님, 돌아오신걸 환영해요!'+Lw+'\n\n입퇴장기록: '+Lw+'\n'+jsonlog[room][obj.user_id].join('\n\n'));
                                        } else { //새로 입장
                                            if(kaan[room]!=undefined) Api.replyRoom(room, kaan[room]['in_new'].replace('${name}', message.members[0].nickName));
                                            else Api.replyRoom(room, message.members[0].nickName+'님, 어서오세요!');
                                        }
                                    } else { //일반 채팅방이라면
                                        if(kaan[room]!=undefined) Api.replyRoom(room, kaan[room]['in_new'].replace('${name}', message.members.map(e=>e.nickName).join(', ')));
                                        else Api.replyRoom(room, message.members.map(e=>e.nickName).join(', ')+'님, 어서오세요:)');
                                    }
                                    break;

                                case 'DELMEM': //퇴장
                                    message = JSON.parse(obj.message);
                                    if (message.feedType == 2) {
                                        if(type == "OM") { //오픈 채팅방이라면
                                            if(jsonlog[room][obj.user_id] == undefined) jsonlog[room][obj.user_id] = [];
                                            jsonlog[room][obj.user_id].push('['+now()+'] '+message.member.nickName+" 닉네임으로 퇴장");
                                            if(kaan[room]!=undefined) Api.replyRoom(room, kaan[room]['out'].replace('${name}', message.member.nickName));
                                            else Api.replyRoom(room, message.member.nickName+'님, 안녕히 가세요:)');
                                        } else { //일반 채팅방이라면
                                            if(kaan[room]!=undefined) Api.replyRoom(room, kaan[room]['out'].replace('${name}', message.member.nickName));
                                            else Api.replyRoom(room, message.member.nickName+'님, 안녕히 가세요:)');
                                        }
                                    } else if(message.feedType == 6) { //내보내짐
                                        /*
                                        if(jsonlog[room][message.member.userId] == undefined) jsonlog[room][message.member.userId] = [];
                                        jsonlog[room][message.member.userId].push('['+now()+'] '+message.member.nickName+" 닉네임으로 내보내짐 (by"+getUserdata(obj.user_id).name+")");
                                        */
                                        if(kaan[room]!=undefined) Api.replyRoom(room, kaan[room]['kick'].replace('${name1}',getUserdata(obj.user_id).name).replace('${name2}', message.member.nickName));
                                        else Api.replyRoom(room,getUserdata(obj.user_id).name + "님이 " + message.member.nickName + "님을 내보내셨습니다.");
                                    }                                   
                                    break;
                                    
                                
                                case 'KICKMEM'://방장이 내보내기                                     
                                    message = JSON.parse(obj.message);                                    
                                    if(message.feedType == 6) {
                                        /*
                                        if(jsonlog[room][message.member.userId] == undefined) jsonlog[room][message.member.userId] = [];
                                        jsonlog[room][message.member.userId].push('['+now()+'] '+message.member.nickName+" 닉네임으로 내보내짐 (by"+getUserdata(obj.user_id).name+")");
                                        */
                                        if(kaan[room]!=undefined) Api.replyRoom(room, kaan[room]['kick'].replace('${name1}',getUserdata(obj.user_id).name).replace('${name2}', message.member.nickName));
                                        else Api.replyRoom(room,getUserdata(obj.user_id).name + "님이 " + message.member.nickName + "님을 내보내셨습니다.");
                                    } 
                                    break;

                                case 'SYNCREWR': //메시지 가리기     
                                    
                                    if(!jsondata[room]['삭제감지']) break;           
                                    message = JSON.parse(obj.message);
                                    if(message.feedType == 13) {
                                        try{                                                                                    
                                            let chat = getRoomChatJson(obj.chat_id, 50, 1);     
                                            for(let i=0; i < 50; i++) {
                                                if(chat[i]['id'] == message.logId) {       
                                                    let pre_message = decrypt(chat[i]['user_id'], chat[i].v.enc, chat[i].v.previous_message);                      
                                                    let m = chattype(message.type, pre_message, chat[i]['attachment']);                          
                                                    Api.replyRoom(room, getUserdata(obj.user_id).name+'님이 '+getUserdata(chat[i]['user_id']).name+'님의 메시지를 가림!'+Lw+'\n\n가려진 메시지:\n'+m);
                                                    break;
                                                } else continue;
                                            }  
                                        } catch(e) {
                                            Log.e('가리기: '+e+' ('+e.lineNumber+')');
                                        }        
                                    }
                                    break;
                                    
                                case 'REWRITE': //메시지 가리기(By 방장)     
                                    
                                    if(!jsondata[room]['삭제감지']) break;           
                                    message = JSON.parse(obj.message);
                                    if(message.feedType == 13) {
                                        try{                                                                                    
                                            let chat = getRoomChatJson(obj.chat_id, 50, 1);     
                                            for(let i=0; i < 50; i++) {
                                                if(chat[i]['id'] == message.logId) {       
                                                    let pre_message = decrypt(chat[i]['user_id'], chat[i].v.enc, chat[i].v.previous_message);                      
                                                    let m = chattype(message.type, pre_message, chat[i]['attachment']);                          
                                                    Api.replyRoom(room, getUserdata(obj.user_id).name+'님이 '+getUserdata(chat[i]['user_id']).name+'님의 메시지를 가림!'+Lw+'\n\n가려진 메시지:\n'+m);
                                                    break;
                                                } else continue;
                                            }  
                                        } catch(e) {
                                            Log.e('가리기: '+e+' ('+e.lineNumber+')');
                                        }        
                                    }
                                    break;
                                    
                                case 'SYNCMEMT': //방장교체                                                       
                                    message = JSON.parse(obj.message);                                           
                                    if(message.feedType == 15) {
                                        Api.replyRoom(room, '새로운 방장 '+message.newHost.nickName + '님을 환영해 주세요!');
                                    }
                                    break;
                                
                                case 'SYNCDLMSG': //메시지 삭제  
                                    
                                    if(!jsondata[room]['삭제감지']) break;                                                      
                                    message = JSON.parse(obj.message);                                           
                                    if (message.feedType == 14 && message.hidden == true) {
                                        try{                                                                  
                                            let chat = getRoomChatJson(obj.chat_id, 50, 1);     
                                            for(let i=0; i < 50; i++) {
                                                if(chat[i]['id'] == message.logId) {                                         
                                                    let m = chattype(chat[i]['type'], chat[i]['message'], chat[i]['attachment']);                                                                   
                                                    if(jsondata[room]['삭제감지']) Api.replyRoom(room, getUserdata(obj.user_id).name+'님이 메시지를 삭제함!'+Lw+'\n\n삭제된 메시지:\n'+m);
                                                    break;
                                                } else continue;
                                            }
                                        } catch(e) {
                                            Log.e('삭메: '+e+' ('+e.lineNumber+')');
                                        }                                                                                         
                                    }
                                    break;
                                
                                case 'DELETEMSG': //메시지 삭제(방장)
                                    
                                    if(!jsondata[room]['삭제감지']) break;                                                      
                                    message = JSON.parse(obj.message);                                           
                                    if (message.feedType == 14 && message.hidden == true) {
                                        try{                                                                  
                                            let chat = getRoomChatJson(obj.chat_id, 50, 1);     
                                            for(let i=0; i < 50; i++) {
                                                if(chat[i]['id'] == message.logId) {                                         
                                                    let m = chattype(chat[i]['type'], chat[i]['message'], chat[i]['attachment']);                                                                   
                                                    if(jsondata[room]['삭제감지']) Api.replyRoom(room, getUserdata(obj.user_id).name+'님이 메시지를 삭제함!'+Lw+'\n\n삭제된 메시지:\n'+m);
                                                    break;
                                                } else continue;
                                            }
                                        } catch(e) {
                                            Log.e('삭메: '+e+' ('+e.lineNumber+')');
                                        }                                                                                         
                                    }
                                    break;

                                default:
                                    break;
                            }                            
                        }
                    }
                    }
                }
                }
            } catch (e) {
                Log.e(e+' ('+e.lineNumber+')');
            }
            }
        }), 0, 1000);
        return true;
        }
        return false;
    },
    stop: function () {
        if (this.looper != null) {
            this.looper.cancel();
            this.looper = null;
            return true;
        }
        return false;
    }
};

let watcher = new DatabaseWatcher();
watcher.start();

/*----------------------------*/
 
function response(room, msg, sender, isGroupChat, replier, ImageDB, packageName){ 
    if(msg=='/MY_KEY') return Api.replyRoom(room, getMyKey());

    if(msg=='/공지') {
       let room_data = getRoomName(roomList()[room]['chat_id']);
       if(room_data==null) return Api.replyRoom(room,'다시 시도해 주세요');
       else return Api.replyRoom(room,'[공지 바로가기]\nhttp://kaan.dothome.co.kr/redirect_close.php?adress=kakaomoim://post?referer=b&chat_id='+room_data['chat_id']+'&post_id='+room_data['moim_meta'].split('"ct\":\"[{\\\"id\\\":\\\"')[1].split('\\\",\\\"owner_id\\\":')[0]);            
    }
    
    if(msg.startsWith("ev.")&&admin_name==sender &&admin_hash==ImageDB.getProfileHash()) {
        try{
            let startTime=new Date().getTime();
            if(msg.length>500)msg = chatLog(roomList()[room]['chat_id'], 1, 1).replace('\n','');
            //msg=msg.replace(/fs/g,'FileStream').replace(/jsoup/g,'org.jsoup.Jsoup.connect');
            Api.replyRoom(room, eval(msg.substr(3)));
            let endTime=new Date().getTime();
            Api.replyRoom(room, "소요시간: "+(endTime-startTime)/1000+"s");
        }catch(e){
            Api.replyRoom(room, msg+'\n'+e+"\nErrorLine: "+e.lineNumber);
        }
        return;
    }
    if(msg=='/방정보') {
        let room_data=roomList()[room];
        if(room_data==null) return Api.replyRoom(room,'다시 시도해 주세요');
        let user_data = getAllusers(room_data['chat_id']);
        let list=[];
        for(i in user_data) list.push('이름: '+user_data[i]+'\n    user_id: '+i);
        return replier.reply('• 방이름: '+room_data['name']+'\n\n• chat_id: '+room_data['chat_id']+Lw+'\n\n• 멤버: \n\n'+list.map(e=>'  ::'+e).join('\n\n'));
    }
    if(msg=='/해시코드') return replier.reply(sender+'님의 해시코드: '+ImageDB.getProfileHash());
        
    if(msg.replace(/ /gi, '') == '/감지off' && jsondata[room] != undefined) {
        if(admin_name!=sender || admin_hash != ImageDB.getProfileHash()) return Api.replyRoom(room, pb+'권한이 없어 거부되었습니다.');
        if(!jsondata[room]['삭제감지']) return Api.replyRoom(room, pb+'이미 해당 기능이 비활성화되어있습니다.\n"/감지on"을 입력해 기능을 활성화시켜보세요!');
        else {
            jsondata[room]['삭제감지'] = false;
            fs.write(pathdata, JSON.stringify(jsondata, null, 4));
            return Api.replyRoom(room, pb+'메시지 삭제 감지 기능이 비활성화되었습니다!\n"/감지on"을 입력하시면 기능이 활성화됩니다.');
        }
    } 
    
    if(msg.replace(/ /gi, '') == '/감지on' && jsondata[room] != undefined) {
        if(admin_name!=sender || admin_hash != ImageDB.getProfileHash()) return Api.replyRoom(room, pb+'권한이 없어 거부되었습니다.');
        if(jsondata[room]['삭제감지']) return Api.replyRoom(room, pb+'이미 해당 기능이 활성화되어있습니다.\n"/감지off"를 입력하면 기능이 비활성화됩니다.');
        else {
            jsondata[room]['삭제감지'] = true;
            fs.write(pathdata, JSON.stringify(jsondata, null, 4));
            return Api.replyRoom(room, pb+'메시지 삭제 감지 기능이 활성화되었습니다!\n"/감지off"을 입력하시면 기능이 비활성화됩니다.');
        }
    } 
    
    if(msg.startsWith('/로그.')) {
        let roomlist = roomList();
        if(!roomlist[room]) return Api.replyRoom(room, 'Error: 다시 시도해 주세요.');
        if(!Number.isInteger(Number(msg.substr(4))) || Number(msg.substr(4))<0) return Api.replyRoom(room, '/로그.자연수 형식으로 작성해 주세요');
        if(Number(msg.substr(4)) > 99) return Api.replyRoom(room, '100개 이하의 채팅만 불러올 수 있습니다.');
        return Api.replyRoom(room, '[채팅로그]'+Lw+'\n\n'+chatLog(roomlist[room]['chat_id'], Number(msg.substr(4).trim())).reverse().join('\n\n'+'\u2501'.repeat(11)+'\n\n'));
    }

    if(msg=='/강제중지' && sender==admin_name && ImageDB.getProfileHash()==admin_hash) {
        watcher.stop();
        return Api.replyRoom(room, 'OFF');
    }
}

function onStartCompile() {
    watcher.stop();
    fs.write(pathlog, JSON.stringify(jsonlog, null, 4));
}

function toByteArray(bytes) {
    let res = _Array.newInstance(_Byte.TYPE, bytes.length);
    for (var i = 0; i < bytes.length; i ++) {
        res[i] = new _Integer(bytes[i]).byteValue();
    }
    return res;
};

function toCharArray(chars) {
    return new _String(chars.map((e) => String.fromCharCode(e)).join("")).toCharArray();
};

function decrypt(userId, enc, text) {
    try {
        let iv = toByteArray([15, 8, 1, 0, 25, 71, 37, -36, 21, -11, 23, -32, -31, 21, 12, 53]);
        let password = toCharArray([22, 8, 9, 111, 2, 23, 43, 8, 33, 33, 10, 16, 3, 3, 7, 6]);
        let prefixes = ["", "", "12", "24", "18", "30", "36", "12", "48", "7", "35", "40", "17", "23", "29", "isabel", "kale", "sulli", "van", "merry", "kyle", "james", "maddux", "tony", "hayden", "paul", "elijah", "dorothy", "sally", "bran"];
        let salt = new _String((prefixes[enc] + userId).slice(0, 16).padEnd(16, "\0")).getBytes("UTF-8");
        let secretKeySpec = new SecretKeySpec(SecretKeyFactory.getInstance("PBEWITHSHAAND256BITAES-CBC-BC").generateSecret(new PBEKeySpec(password, salt, 2, 256)).getEncoded(), "AES");
        let ivParameterSpec = new IvParameterSpec(iv);
        let cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(2, secretKeySpec, ivParameterSpec);
        return String(new _String(cipher.doFinal(Base64.decode(text, 0)), "UTF-8"));
    } catch (e) {
        return null;
    }
}
 function requestPermission() {
    try {
        Runtime.getRuntime().exec([
        "su",
        "mount -o remount rw /data/data/com.kakao.talk/databases",
        "chmod -R 777 /data/data/com.kakao.talk/databases"
        ]).waitFor();
        return true;
    } catch (e) {
        return false;
    }
}
function initializeDB() {
    try {
        if (db != null && db2 != null) {
        db.close();
        db2.close();
        }
        db = SQLiteDatabase.openDatabase("/data/data/com.kakao.talk/databases/KakaoTalk.db", null, SQLiteDatabase.CREATE_IF_NECESSARY);
        db2 = SQLiteDatabase.openDatabase("/data/data/com.kakao.talk/databases/KakaoTalk2.db", null, SQLiteDatabase.CREATE_IF_NECESSARY);
        return true;
    } catch (e) {
        requestPermission();
        return false;
    }
}

function DatabaseWatcher() {
    this.looper = null;
    this.pre = null;
};
