# GetStream 채팅 구현 가이드

## 1. 소개

이 프로젝트는 GetStream을 이용한 실시간 채팅 기능을 구현한 예제입니다. 다음 기능들을 포함합니다:

- 일반 채팅방 생성 및 관리
- 라이브 스트림 채팅
- 사용자 검색 및 초대
- 메시지 전송, 편집, 삭제
- 이모지 및 파일 첨부

## 2. 설치 방법

프로젝트에 필요한 패키지를 설치합니다:

```bash
npm install stream-chat stream-chat-react @emoji-mart/data emoji-mart date-fns react-icons
```

## 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```
# GetStream API 키
NEXT_PUBLIC_STREAM_API_KEY=your_api_key
STREAM_API_SECRET=your_api_secret
```

GetStream API 키는 [GetStream 대시보드](https://getstream.io/dashboard/)에서 확인할 수 있습니다.

## 4. 주요 파일 구조

- `/app/(client)/chat/[id]/components/` - 채팅 컴포넌트
  - `chatComplete.js` - 메인 채팅 인터페이스
  - `CreateChannel.js` - 새 채팅방 생성 컴포넌트
  - `CustomMessage.js` - 메시지 표시 커스텀 컴포넌트
  - `CustomInput.js` - 메시지 입력 커스텀 컴포넌트
- `/app/(client)/chat/[id]/lib/` - 유틸리티 함수
  - `action.js` - 서버 액션 (토큰 생성, 사용자 검색 등)
- `/app/(client)/livestream/` - 라이브 스트림 채팅
  - `page.js` - 라이브 스트림 채팅 페이지
- `/app/api/chat/token/` - 토큰 발급 API
  - `route.js` - 토큰 발급 라우트 핸들러

## 5. 사용 방법

1. 환경 변수 설정: GetStream API 키를 `.env.local` 파일에 설정합니다.
2. 서버 실행: `npm run dev` 명령어로 개발 서버를 실행합니다.
3. 채팅 접속: `/chat/1` 경로로 접속하여 채팅을 시작합니다.
4. 라이브 스트림: `/livestream` 경로로 접속하여 라이브 스트림 채팅을 시작합니다.

## 6. 커스터마이징

### 사용자 인증 연동

현재 고정된 사용자 ID를 사용하고 있으며, 실제 애플리케이션에서는 로그인한 사용자의 ID를 사용하도록 수정해야 합니다.

```javascript
// 예: 현재 로그인한 사용자 정보 사용
const user = {
  id: session.user.id,
  name: session.user.name,
  image: session.user.image,
};
```

### 채널 타입 설정

GetStream에서는 다양한 타입의 채널을 지원합니다:

- `messaging`: 일반 메시징
- `livestream`: 라이브 스트림
- `gaming`: 게임 채팅
- `commerce`: 상거래 채팅
- `team`: 팀 협업

채널 타입에 따라 UI와 권한이 자동으로 조정됩니다.

## 7. 문제 해결

- **토큰 생성 오류**: API 키와 시크릿이 올바르게 설정되었는지 확인합니다.
- **연결 오류**: 네트워크 연결 및 API 키의 권한 설정을 확인합니다.
- **메시지 전송 실패**: 클라이언트 쪽과 서버 쪽의 로그를 확인합니다.

## 8. 참고 자료

- [GetStream 공식 문서](https://getstream.io/chat/docs/)
- [React SDK 문서](https://getstream.io/chat/docs/react/)
- [API 참조](https://getstream.io/chat/docs/react/creating_channels/) 