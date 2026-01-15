import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { generateLetter } from "./letterGenerator";
import { generateBabyImage } from "./babyGenerator";
import { GenerateLetterRequest, GenerateLetterResponse, LetterDocument, GenerateBabyRequest, GenerateBabyResponse } from "./types";

// Firebase Admin 초기화
admin.initializeApp();

// Firestore 인스턴스
const db = admin.firestore();

// CORS 설정을 위한 helper
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * 캐릭터 편지 생성 API
 * POST /generateLetter
 */
export const generateCharacterLetter = functions
  .region("asia-northeast3") // 서울 리전
  .runWith({
    secrets: ["GEMINI_API_KEY"],
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
      } as GenerateLetterResponse);
      return;
    }

    try {
      const requestBody = req.body as GenerateLetterRequest;

      // 필수 필드 검증
      if (!requestBody.character || !requestBody.chatHistory) {
        res.set(corsHeaders);
        res.status(400).json({
          success: false,
          error: "character와 chatHistory는 필수입니다.",
        } as GenerateLetterResponse);
        return;
      }

      if (!requestBody.character.name || !requestBody.character.traits) {
        res.set(corsHeaders);
        res.status(400).json({
          success: false,
          error: "character.name과 character.traits는 필수입니다.",
        } as GenerateLetterResponse);
        return;
      }

      // 편지 생성
      const letter = await generateLetter(requestBody);

      // Firestore에 저장
      const letterDoc: LetterDocument = {
        characterName: requestBody.character.name,
        letter: letter,
        letterType: requestBody.letterType,
        createdAt: new Date(),
      };

      const docRef = await db.collection("letters").add(letterDoc);

      res.set(corsHeaders);
      res.status(200).json({
        success: true,
        letter: letter,
        letterId: docRef.id,
      } as GenerateLetterResponse);
    } catch (error) {
      console.error("편지 생성 오류:", error);
      res.set(corsHeaders);
      res.status(500).json({
        success: false,
        error: "편지 생성 중 오류가 발생했습니다.",
      } as GenerateLetterResponse);
    }
  });

/**
 * Callable 함수 버전 (Firebase SDK로 호출할 때 사용)
 */
export const generateCharacterLetterCallable = functions
  .region("asia-northeast3")
  .runWith({
    secrets: ["GEMINI_API_KEY"],
  })
  .https.onCall(async (data: GenerateLetterRequest, _context) => {
    // 필수 필드 검증
    if (!data.character || !data.chatHistory) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "character와 chatHistory는 필수입니다."
      );
    }

    try {
      const letter = await generateLetter(data);
      return {
        success: true,
        letter: letter,
      } as GenerateLetterResponse;
    } catch (error) {
      console.error("편지 생성 오류:", error);
      throw new functions.https.HttpsError(
        "internal",
        "편지 생성 중 오류가 발생했습니다."
      );
    }
  });

/**
 * 단일 편지 조회 API
 * GET /getLetter?id={letterId}
 */
export const getLetter = functions
  .region("asia-northeast3")
  .https.onRequest(async (req, res) => {
    if (req.method === "OPTIONS") {
      res.set(corsHeaders);
      res.status(204).send("");
      return;
    }

    if (req.method !== "GET") {
      res.set(corsHeaders);
      res.status(405).json({ success: false, error: "Method not allowed" });
      return;
    }

    try {
      const letterId = req.query.id as string;

      if (!letterId) {
        res.set(corsHeaders);
        res.status(400).json({ success: false, error: "id 파라미터가 필요합니다." });
        return;
      }

      const doc = await db.collection("letters").doc(letterId).get();

      if (!doc.exists) {
        res.set(corsHeaders);
        res.status(404).json({ success: false, error: "편지를 찾을 수 없습니다." });
        return;
      }

      res.set(corsHeaders);
      res.status(200).json({
        success: true,
        data: { id: doc.id, ...doc.data() },
      });
    } catch (error) {
      console.error("편지 조회 오류:", error);
      res.set(corsHeaders);
      res.status(500).json({ success: false, error: "편지 조회 중 오류가 발생했습니다." });
    }
  });

/**
 * 편지 목록 조회 API
 * GET /getLetters?limit={number}&characterName={string}
 */
export const getLetters = functions
  .region("asia-northeast3")
  .https.onRequest(async (req, res) => {
    if (req.method === "OPTIONS") {
      res.set(corsHeaders);
      res.status(204).send("");
      return;
    }

    if (req.method !== "GET") {
      res.set(corsHeaders);
      res.status(405).json({ success: false, error: "Method not allowed" });
      return;
    }

    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const characterName = req.query.characterName as string;

      let query: FirebaseFirestore.Query = db.collection("letters")
        .orderBy("createdAt", "desc")
        .limit(limit);

      if (characterName) {
        query = query.where("characterName", "==", characterName);
      }

      const snapshot = await query.get();
      const letters = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.set(corsHeaders);
      res.status(200).json({
        success: true,
        data: letters,
        count: letters.length,
      });
    } catch (error) {
      console.error("편지 목록 조회 오류:", error);
      res.set(corsHeaders);
      res.status(500).json({ success: false, error: "편지 목록 조회 중 오류가 발생했습니다." });
    }
  });

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
