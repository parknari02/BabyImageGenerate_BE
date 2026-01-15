import * as dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GenerateBabyRequest } from "./types";
import { getRealisticPrompt, getCharacterPrompt } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// 생성 결과 타입
export interface GenerateBabyResult {
  girlImage: string;
  boyImage: string;
}

/**
 * 단일 아기 이미지를 생성합니다.
 */
async function generateSingleBabyImage(
  characterImage: string,
  userImage: string,
  isRealistic: boolean,
  gender: "girl" | "boy"
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-3-pro-image-preview",
    generationConfig: {
      // @ts-ignore - responseModalities는 타입 정의에 없음
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  const prompt = isRealistic
    ? getRealisticPrompt(gender)
    : getCharacterPrompt(gender);

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: characterImage,
      },
    },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: userImage,
      },
    },
  ]);

  const response = result.response;
  const candidates = response.candidates;

  if (!candidates || candidates.length === 0) {
    throw new Error("이미지 생성에 실패했습니다.");
  }

  const parts = candidates[0].content?.parts;
  if (!parts) {
    throw new Error("응답에서 이미지를 찾을 수 없습니다.");
  }

  for (const part of parts) {
    // @ts-ignore - inlineData 타입 체크
    if (part.inlineData) {
      // @ts-ignore
      return part.inlineData.data;
    }
  }

  throw new Error("생성된 이미지를 찾을 수 없습니다.");
}

/**
 * 캐릭터 얼굴과 사용자 얼굴을 조합해 여자아이/남자아이 2세 이미지를 생성합니다.
 */
export async function generateBabyImage(
  request: GenerateBabyRequest
): Promise<GenerateBabyResult> {
  const { characterImage, userImage, style = "character" } = request;
  const isRealistic = style === "realistic";
  // 여자아이, 남자아이 이미지 병렬 생성
  const [girlImage, boyImage] = await Promise.all([
    generateSingleBabyImage(characterImage, userImage, isRealistic, "girl"),
    generateSingleBabyImage(characterImage, userImage, isRealistic, "boy"),
  ]);

  return { girlImage, boyImage };
}
