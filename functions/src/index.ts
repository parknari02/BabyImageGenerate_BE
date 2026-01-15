import * as functions from "firebase-functions";
import { generateBabyImage } from "./babyGenerator";
import { GenerateBabyRequest, GenerateBabyResponse } from "./types";

// CORS 설정을 위한 helper
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * 2세 사진 생성 API
 * POST /generateBaby
 *
 * Request Body:
 * - characterImage: 캐릭터 얼굴 이미지 (base64)
 * - userImage: 사용자 얼굴 이미지 (base64)
 * - style?: 생성 스타일 ("realistic" | "character")
 *
 * Response:
 * - girlImage: 여자아이 이미지 (base64)
 * - boyImage: 남자아이 이미지 (base64)
 */
export const generateBaby = functions
  .region("asia-northeast3")
  .runWith({
    secrets: ["GEMINI_API_KEY"],
    timeoutSeconds: 120,
    memory: "512MB",
  })
  .https.onRequest(async (req, res) => {
    // CORS preflight 처리
    if (req.method === "OPTIONS") {
      res.set(corsHeaders);
      res.status(204).send("");
      return;
    }

    // POST 메서드만 허용
    if (req.method !== "POST") {
      res.set(corsHeaders);
      res.status(405).json({
        success: false,
        error: "Method not allowed",
      } as GenerateBabyResponse);
      return;
    }

    try {
      const requestBody = req.body as GenerateBabyRequest;

      // 필수 필드 검증
      if (!requestBody.characterImage || !requestBody.userImage) {
        res.set(corsHeaders);
        res.status(400).json({
          success: false,
          error: "characterImage와 userImage는 필수입니다.",
        } as GenerateBabyResponse);
        return;
      }

      // 2세 이미지 생성 (여자아이, 남자아이 둘 다)
      const { girlImage, boyImage } = await generateBabyImage(requestBody);

      res.set(corsHeaders);
      res.status(200).json({
        success: true,
        girlImage,
        boyImage,
      } as GenerateBabyResponse);
    } catch (error) {
      console.error("2세 사진 생성 오류:", error);
      res.set(corsHeaders);
      res.status(500).json({
        success: false,
        error: "2세 사진 생성 중 오류가 발생했습니다.",
      } as GenerateBabyResponse);
    }
  });

/**
 * 2세 사진 생성 Callable 함수 (Firebase SDK로 호출할 때 사용)
 */
export const generateBabyCallable = functions
  .region("asia-northeast3")
  .runWith({
    secrets: ["GEMINI_API_KEY"],
    timeoutSeconds: 120,
    memory: "512MB",
  })
  .https.onCall(async (data: GenerateBabyRequest, _context) => {
    // 필수 필드 검증
    if (!data.characterImage || !data.userImage) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "characterImage와 userImage는 필수입니다."
      );
    }

    try {
      const { girlImage, boyImage } = await generateBabyImage(data);
      return {
        success: true,
        girlImage,
        boyImage,
      } as GenerateBabyResponse;
    } catch (error) {
      console.error("2세 사진 생성 오류:", error);
      throw new functions.https.HttpsError(
        "internal",
        "2세 사진 생성 중 오류가 발생했습니다."
      );
    }
  });
