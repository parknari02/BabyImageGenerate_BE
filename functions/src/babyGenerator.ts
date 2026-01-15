import * as dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GenerateBabyRequest } from "./types";

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
    model: "gemini-2.5-flash-image",
    generationConfig: {
      // @ts-ignore - responseModalities는 타입 정의에 없음
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  const babyTerm = gender === "girl" ? "baby girl" : "baby boy";

  const prompt = isRealistic
    ? `Generate a stunningly high-quality, photorealistic portrait of a cute ${babyTerm} (approx 3-4 years old).

INPUTS:
- Image 1: Parent A (Stylized/2D character)
- Image 2: Parent B (Real person)

STEP 1 - ANALYZE PARENT A (Image 1):
Extract and translate these 2D features into realistic human equivalents:
- Eye shape, size, and color
- Eyebrow thickness and arch
- Nose bridge height and tip shape
- Jawline and face shape (round/oval/angular)
- Hair color, texture, and style
- Any distinctive features (dimples, moles, ear shape)

STEP 2 - ANALYZE PARENT B (Image 2):
Identify these real features:
- Eye shape, size, double eyelid presence, and color
- Nose shape and size
- Lip shape and fullness
- Face shape and cheekbone structure
- Skin tone
- Hair color and texture
- Any distinctive features

STEP 3 - GENETIC BLEND:
Create the child by combining:
- Eyes: Blend Parent A's translated eye shape + Parent B's eye features
- Nose: Blend both, slightly favor the more prominent features
- Face shape: Average of both parents
- Hair: Blend color and texture naturally
- Skin tone: Natural mix of both
- Include at least ONE distinctive feature from EACH parent

VISUALS:
- The baby must be extremely cute and beautiful ("K-pop idol childhood" vibe).
- Large, sparkling eyes with catchlights
- Soft, natural skin texture with realistic lighting (studio portrait style)
- Background: Soft blurred, warm beige/cream tone
- Expression: Looking at camera, soft lovely smile

OUTPUT:
A single high-quality photograph where viewers can clearly identify features from both parents. No text, no split screens.`

    : `Create a high-quality "Manhwa/Webtoon" style illustration of a ${babyTerm} (approx 3-4 years old).

INPUTS:
- Image 1: Parent A (Target Art Style Reference)
- Image 2: Parent B (Real person to be stylized)

STEP 1 - ANALYZE PARENT A (Image 1):
Study and extract:
- Art style: Line weight, coloring technique, shading method
- Character features: Eye design, hair rendering, face proportions
- Color palette used
- Any signature features (eye sparkles, blush style, etc.)

STEP 2 - ANALYZE PARENT B (Image 2):
Identify distinctive real features to preserve in stylized form:
- Eye shape (monolid/double eyelid, round/almond)
- Face shape and proportions
- Nose and lip characteristics
- Hair color and style
- Skin tone
- Any unique features (beauty marks, dimples, etc.)

STEP 3 - STYLIZED GENETIC BLEND:
- Convert Parent B's features into the EXACT art style of Image 1
- Eyes: Combine Parent A's anime eye DESIGN with Parent B's eye SHAPE
- Hair: Blend colors, use Parent A's rendering technique
- Face: Mix both face shapes in 2D proportions
- Include at least ONE recognizable trait from EACH parent

VISUALS:
- Art Style: Match Image 1's line weight, coloring, and shading EXACTLY
- Big expressive eyes with style-appropriate sparkles
- Cute, charming expression with slight head tilt
- Background: Simple solid or gradient matching Image 1's palette

OUTPUT:
A single character illustration where the child is clearly "from this art style's world" but obviously inherits features from both parents. No photorealism, no text.`;

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
