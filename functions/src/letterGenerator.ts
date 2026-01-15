import * as dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GenerateLetterRequest } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function buildPrompt(request: GenerateLetterRequest): string {
  const { character, chatHistory, letterType, additionalContext } = request;

  // 대화 내역 포맷팅
  const formattedChat = chatHistory
    .slice(-20) // 최근 20개 대화만 사용
    .map((msg) => `${msg.role === "user" ? "유저" : character.name}: ${msg.content}`)
    .join("\n");

  const prompt = `당신은 "${character.name}"라는 캐릭터입니다. 이 캐릭터로서 유저에게 진심 어린 편지를 작성해주세요.

## 캐릭터 정보
- 이름: ${character.name}
- 성격 특성: ${character.traits.join(", ")}
- 말투 스타일: ${character.speechStyle}
- 유저와의 관계: ${character.relationship}
${character.backgroundStory ? `- 배경 스토리: ${character.backgroundStory}` : ""}

## 이전 대화 내역
${formattedChat || "(대화 내역 없음)"}

## 편지 작성 가이드
- 편지 유형: ${letterType || "일상"}
${additionalContext ? `- 추가 상황: ${additionalContext}` : ""}

## 작성 규칙
1. 캐릭터의 성격과 말투를 일관되게 유지하세요.
2. 이전 대화에서 나눈 내용을 자연스럽게 언급하세요.
3. 유저와의 관계에 맞는 적절한 거리감을 유지하세요.
4. 편지 유형과 추가 상황을 반영해 적절한 톤과 내용을 선택하세요.
5. 진심이 느껴지는 따뜻한 편지를 작성하세요.
6. 편지 형식(인사 → 본문 → 마무리)을 지켜주세요.
7. 500~700자 내외로 작성하세요.

지금 바로 편지를 작성해주세요:`;

  return prompt;
}

export async function generateLetter(
  request: GenerateLetterRequest
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = buildPrompt(request);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const letter = response.text();

  return letter;
}
