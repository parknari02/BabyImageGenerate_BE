/**
 * 공통 포즈 & 프레이밍 규칙
 */
export const COMMON_POSE_BLOCK = `
GLOBAL POSE & FRAMING RULE (ABSOLUTE, NO EXCEPTIONS):
- Head facing directly forward (0-degree rotation)
- Eyes looking straight at the camera/viewer
- Neutral head position (no tilt, no angle)
- Shoulders aligned horizontally
- Framing: shoulders-up portrait only
- Subject centered perfectly in the frame
- Identical pose, angle, and framing across all generations
- This rule overrides all other instructions
`;

/**
 * 실사 스타일 프롬프트 생성
 */
export function getRealisticPrompt(gender: "girl" | "boy"): string {
  const babyTerm = gender === "girl" ? "girl child" : "boy child";

  return `
Generate a realistic portrait of a ${babyTerm}, approximately 3–4 years old.

INPUTS:
- Image 1: Parent A (stylized / character image)
- Image 2: Parent B (real human photo)

PRIMARY GOAL:
Create a believable real child who looks like the natural biological average of both parents.
The child must look like a real person who could exist in everyday life.
Avoid stylization, exaggeration, or idealized beauty.

FACIAL STRUCTURE (VERY IMPORTANT):
- Face shape, head size, and proportions must be the numerical middle point between Parent A and Parent B.
- Do NOT exaggerate any single feature.
- Overall structure must feel neutral and balanced.

FEATURE INHERITANCE RULES:
- Eyes: Shape from Parent B, color/expression inspired by Parent A.
- Nose: Simple, child-appropriate blend of both parents. No sharp or dramatic bridge.
- Mouth: Soft, natural shape. No stylized smiles.
- Eyebrows: Neutral thickness, average arch.

AGE RULES:
- Large child-like eyes relative to face
- Soft cheeks, but no baby exaggeration
- Subtle bone structure only

SKIN & TEXTURE:
- Real human skin texture
- Natural pores and softness
- No plastic, no doll-like skin

LIGHTING & CAMERA:
- Soft, even lighting (passport or studio portrait style)
- Neutral camera angle, eye-level
- No dramatic shadows or cinematic lighting

BACKGROUND:
- Plain, light neutral background

STRICT CONSTRAINTS:
- No celebrity resemblance
- No fantasy beauty
- No stylization
- No artistic interpretation

OUTPUT:
One realistic photo of a normal, believable child.
No text. No watermark.

${COMMON_POSE_BLOCK}
`;
}

/**
 * 캐릭터 스타일 프롬프트 생성
 */
export function getCharacterPrompt(gender: "girl" | "boy"): string {
  const babyTerm = gender === "girl" ? "girl child" : "boy child";

  const genderNuance = gender === "girl"
    ? `
- Slightly softer and gentler overall impression
- Subtle roundness in cheeks or eye expression
- No makeup or adult femininity
`
    : `
- Calm and neutral overall impression
- Very subtle firmness in jaw or brow area
- No exaggerated masculinity
`;

  return `Create a high-quality character illustration of a child (approximately 3–4 years old).

INPUTS:
- Image 1: Parent A (original character / manhwa-style illustration)
- Image 2: Parent B (real human photo)

PRIMARY GOAL:
Create a believable second-generation child character who clearly looks like the biological child of both parents.
The child should feel natural and ordinary within the same world and art style as Parent A.
Avoid idealized beauty, exaggeration, or "main character" features.

IMPORTANT BALANCE RULE:
Both parents must contribute equally to the child's appearance,
regardless of the child's gender.
Do NOT associate gender with either parent's facial dominance.

STYLE (VERY IMPORTANT):
- Follow the EXACT art style of Image 1.
- Preserve line thickness, coloring method, shading, and eye rendering.
- Do NOT introduce new stylistic elements.
- Image 1 defines all visual and stylistic rules.

CHARACTER TRANSLATION:
- Convert Parent B's real human features into the art style of Image 1.
- Maintain facial proportions, eye spacing, nose size, and mouth shape from Parent B.
- No photorealistic textures.

FACIAL STRUCTURE:
- Face shape and proportions must be the visual average of Parent A and Parent B.
- Avoid sharp V-lines, extreme roundness, or exaggerated features.
- Keep the face balanced and neutral.

FEATURE INHERITANCE RULES:
- Eyes:
  - Use Parent A's eye design (style, highlights, lashes)
  - Apply Parent B's eye shape, spacing, and tilt
- Nose:
  - Simple, child-appropriate blend of both parents
- Mouth:
  - Soft, neutral shape
  - No exaggerated expressions
- Eyebrows:
  - Natural thickness and arch, consistent with Image 1 style

AGE RULES:
- Age: 3–4 years old
- Slightly larger head-to-body ratio
- Soft cheeks with minimal bone definition
- Child-like but not baby-like

GENDER PRESENTATION (IMPORTANT):
- This is a ${babyTerm}
- The child's gender should be clearly recognizable at first glance,
  but without relying on exaggerated stereotypes.
- Use a natural combination of facial impression, hairstyle silhouette,
  and subtle details to express gender.
- The gender should remain identifiable even if the hairstyle changes.

GENDER NUANCE:
${genderNuance}

HAIR GUIDELINES:
- Choose a hairstyle appropriate for a 3–4 year old child.
- Hairstyle does NOT need to be fixed or stereotypical.
- Hair length, parting, or small accessories (if any) should feel natural
  and consistent with the art style of Image 1.
- Avoid adult hairstyles or overly decorative elements.

COLOR & RENDERING:
- Skin tone: blended naturally from both parents, adapted to the art style
- No excessive blush, glow, or lighting effects

BACKGROUND:
- Simple solid color or soft gradient
- No props, no environment details

STRICT CONSTRAINTS:
- No photorealism
- No fantasy elements
- No celebrity resemblance
- No dramatic lighting
- No text or watermark

OUTPUT:
A single character illustration of a child who clearly resembles both parents
and fits naturally within the same world and art style as Image 1.

${COMMON_POSE_BLOCK}
`;
}
