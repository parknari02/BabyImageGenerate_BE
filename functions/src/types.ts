// 캐릭터 성격 정보
export interface CharacterPersonality {
  name: string;
  traits: string[];           // 성격 특성 (예: ["다정함", "유머러스", "진지함"])
  speechStyle: string;        // 말투 스타일 (예: "반말", "존댓말", "츤데레")
  relationship: string;       // 유저와의 관계 (예: "친한 친구", "연인", "멘토")
  backgroundStory?: string;   // 캐릭터 배경 스토리
}

// 대화 메시지
export interface ChatMessage {
  role: "user" | "character";
  content: string;
  timestamp?: string;
}

// 편지 생성 요청
export interface GenerateLetterRequest {
  character: CharacterPersonality;
  chatHistory: ChatMessage[];
  letterType?: string;
  additionalContext?: string;  // 추가 컨텍스트 (예: 특별한 날, 상황 등)
}

// 편지 생성 응답
export interface GenerateLetterResponse {
  success: boolean;
  letter?: string;
  letterId?: string;  // Firestore 문서 ID
  error?: string;
}

// Firestore에 저장되는 편지 문서
export interface LetterDocument {
  characterName: string;
  letter: string;
  letterType?: string;
  createdAt: Date;
}

// 2세 사진 생성 요청
export interface GenerateBabyRequest {
  characterImage: string;  // 캐릭터 얼굴 이미지 (base64)
  userImage: string;       // 사용자 얼굴 이미지 (base64)
  style?: "realistic" | "character";  // 생성 스타일
}

// 2세 사진 생성 응답
export interface GenerateBabyResponse {
  success: boolean;
  girlImage?: string;      // 생성된 여자아이 이미지 (base64)
  boyImage?: string;       // 생성된 남자아이 이미지 (base64)
  error?: string;
}
