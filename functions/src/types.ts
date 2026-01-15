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
