# Hibot_kakao
<b>현재 9.0 미만 구버전만 작동합니다.</b><br>
입퇴장 등등을 알려주는 봇 입니다<br>
원본 소스는[여기](https://cafe.naver.com/nameyee/14642 ← 삭제됨)를 참고해주세요<br>
<b>절대 제가 만든게 아닙니다</b>
## 설치방법
bot.js에서 봇이름과 KEY값을 변경해 줍니다.그러고 나서 [메신저봇R](https://play.google.com/store/apps/details?id=com.xfl.msgbot)에 붙여넣어 주세요<br>
msgbot.sh를 /bin/폴더에 복사하고 권한을 777또는 실행에 모두 체크합니다<br/>

## 자주하는 질문
### 컴파일이 안돼여ㅠㅠㅠ<br>
-> 코드 제대로 복붙했는지 확인해주세요<br>
### 히익 No such file...으로 시작하는 에러로그가 넘쳐나요!<br>
#### msgbot.sh파일도 /bin폴더에 정상적으로 있어요!<br>
-> [여기](https://play.google.com/store/apps/details?id=jackpal.androidterm&hl=ko)에서 msgbot.sh라고 쳐보세요<br>
##### "/system/bin/sh : msgbot.sh : not found"라고 떠요!<br>
-> /bin/msgbot.sh를 /system/bin/폴더로 옮겨보세요<br>
##### "/system/bin/sh : msgbot.sh : can't execute: Permission denied"라는데요?<br>
-> 권한 설정 하셔야죠...<br>
### msgbot.sh파일이 뭐죠?어떻게 만들죠?<br>
-> Android 업데이트로 인해 카톡db로 직접적인 접근이 거부되어서 root 권한으로 내부저장소에 복사해주는 파일입니다. 이 글 마지막부분에 있어요<br>
### 루팅해야해요?<br>
-> 네.[여기](https://namkisec.tistory.com/entry/Magisk%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%9C-%EC%95%88%EB%93%9C%EB%A1%9C%EC%9D%B4%EB%93%9C-%EB%A3%A8%ED%8C%85tutorial)보고 하시면 됩니다.<br>
### 봇을 껐는데 봇이 작동합니다?!?!(심지어 봇을 삭제해도)<br>
-> 채팅방에 "/강제중지" 라고 쳐주세요:) 관리자만 가능합니다.<br>
### 응답을 안하거나 응답이 느려요ㅠㅜ<br>
-> 카톡 저장 메모리가 꽉차면 DB 업데이트를 해요. 한번 활동이 왕성한 아무 오픈쳇팅방에 들어가봐요<br>
### "null님 안녕하세요! 공지에 있는 규칙 필독해주세요."같은 이상한 메시지가 떠요<br>
-> 어... db오류인데 속도가 너무느려서 이전 Thread가 끝나지 못하고 db를 읽고있는데 다음 thread가 작동하면 그럴지도?(정확한 원인은 분석중 입니다!)<br>

## 기능소개
### 입퇴장 감지
![image](https://user-images.githubusercontent.com/88792658/130347858-cd641285-e07c-48a4-8ff4-92f267f92760.png)
![image](https://user-images.githubusercontent.com/88792658/130347868-6c5f3f37-cfb3-4e78-8bdf-3d315c02859a.png)
### 내보내기시 누가 내보냈는지 확인가능
![image](https://user-images.githubusercontent.com/88792658/130347880-2e2b38c7-39c2-4ab9-93e5-c702715b1b3f.png)
### 메시지 삭제, 가리기 시 메시지 출력
![image](https://user-images.githubusercontent.com/88792658/130347890-780b3314-8f42-48cf-b7af-007ec8319472.png)
### 메시지 삭제 감지on/off 기능
![image](https://user-images.githubusercontent.com/88792658/130347910-7d427055-f649-4b8c-b7e9-9d76f9ede82c.png)
