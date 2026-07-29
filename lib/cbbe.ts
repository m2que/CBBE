import type { CBBEData, GeminiModelOption, Reference, ReferenceCategory } from '../types';

const VALID_CATEGORIES: ReferenceCategory[] = [
  'official_brand',
  'government',
  'industry_databases',
  'news_media',
  'academic_research',
  'marketing_reports'
];

const REFERENCE_CATEGORY_LABELS: Record<ReferenceCategory, string> = {
  official_brand: 'official brand source',
  government: 'government or public institution source',
  industry_databases: 'industry database or consultancy source',
  news_media: 'reputable news source',
  academic_research: 'academic source',
  marketing_reports: 'marketing or trade report'
};

export const DEFAULT_MODEL: GeminiModelOption = 'gemini-2.5-flash';

export const AVAILABLE_MODELS: { value: GeminiModelOption; label: string; description: string }[] = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', description: 'Faster default for everyday searches' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'Slower, but stronger reasoning for harder analyses' }
];

const normalizeCategory = (category: string): ReferenceCategory => {
  const cleaned = category.toLowerCase().trim();

  if (VALID_CATEGORIES.includes(cleaned as ReferenceCategory)) {
    return cleaned as ReferenceCategory;
  }

  if (cleaned.includes('news') || cleaned.includes('bloomberg') || cleaned.includes('reuters') || cleaned.includes('times')) return 'news_media';
  if (cleaned.includes('gov') || cleaned.includes('census') || cleaned.includes('who') || cleaned.includes('un')) return 'government';
  if (cleaned.includes('academic') || cleaned.includes('scholar') || cleaned.includes('edu') || cleaned.includes('journal')) return 'academic_research';
  if (cleaned.includes('brand') || cleaned.includes('official') || cleaned.includes('company') || cleaned.includes('investor')) return 'official_brand';
  if (cleaned.includes('database') || cleaned.includes('statista') || cleaned.includes('gartner') || cleaned.includes('mckinsey') || cleaned.includes('deloitte')) return 'industry_databases';
  if (cleaned.includes('report') || cleaned.includes('marketing') || cleaned.includes('association') || cleaned.includes('trade')) return 'marketing_reports';

  return 'news_media';
};

const dedupeReferences = (references: Reference[]): Reference[] => {
  const seen = new Set<string>();

  return references.filter((ref) => {
    const key = ref.url.replace(/\/$/, '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const isAcademicSource = (url: string, title: string): boolean => {
  const lowerUrl = url.toLowerCase();
  const lowerTitle = title.toLowerCase();

  return [
    'scholar.google',
    'researchgate.net',
    'jstor.org',
    'sciencedirect.com',
    'springer.com',
    'wiley.com',
    'tandfonline.com',
    'sagepub.com',
    'emerald.com',
    '.edu'
  ].some((token) => lowerUrl.includes(token))
    || ['journal', 'study', 'research', 'paper'].some((token) => lowerTitle.includes(token));
};

const ensureAcademicReferences = (references: Reference[], verifiedSources: Map<string, string>, brandName: string): Reference[] => {
  const academicRefs = dedupeReferences(
    references.filter((ref) => ref.category === 'academic_research' || isAcademicSource(ref.url, ref.title))
      .map((ref) => ({
        ...ref,
        category: 'academic_research' as ReferenceCategory,
        relevanceNote: ref.relevanceNote?.trim() || `Academic source students can cite when explaining the ${brandName} CBBE score.`
      }))
  );

  if (academicRefs.length > 0) {
    return academicRefs.slice(0, 5);
  }

  const groundedAcademicRefs = Array.from(verifiedSources.entries())
    .filter(([url, title]) => isAcademicSource(url, title || ''))
    .slice(0, 5)
    .map(([url, title]) => ({
      title: title || url,
      url,
      category: 'academic_research' as ReferenceCategory,
      relevanceNote: `Recovered from grounded search results as an academic source students can cite for ${brandName}.`
    }));

  if (groundedAcademicRefs.length > 0) {
    return groundedAcademicRefs;
  }

  return references.length > 0
    ? dedupeReferences(references).slice(0, 1).map((ref) => ({
        ...ref,
        relevanceNote: `No academic source was grounded for ${brandName}; this is the strongest available fallback source.`
      }))
    : [];
};

export const buildCBBEPrompt = (brandName: string): string => `
    OBJECTIVE: Return the "Top 10%" most authoritative insights using a "Positive Selection" strategy for the brand: "${brandName}".

    CRITICAL RULE: QUALITY > SPECIFICITY
    It is better to provide high-quality "Industry Average" data than low-quality "Brand Specific" data.

    STEP 1: CONTEXTUAL EXPANSION
    If "${brandName}" is a specific brand, identify its broader industry (e.g., "The Giving Movement" -> "Sustainable Fashion").
    SEARCH STRATEGY: Search for the specific brand first.
    DECISION POINT: If the only sources for the brand are user-generated or low quality, YOU MUST DISCARD THEM and use data from the BROADER INDUSTRY instead.

    STEP 2: SOURCE SELECTION & CATEGORIZATION (STRICT LIMIT)
    You MUST use the Google Search tool.
    You MUST populate the 'references' array in the JSON output.
    You MUST categorize every source into one of the 6 allowed categories.
    You MUST include academic references suitable for a student report.
    You SHOULD aim for 1-5 total references, using academic references only unless none are present in grounded search results.

    FILTERING RULES (CRITICAL):
    - NO BROKEN LINKS. Only use URLs explicitly returned by the search tool.
    - CHECK RELEVANCE: Do NOT include "System" artifacts like "Current time", "Weather", "Google Maps", or generic search pages. Only include actual content pages used for the analysis.
    - STRICT LIMIT: Include a MAXIMUM of 3 references per category.
    - VERIFICATION: Copy the URL exactly as provided by the Google Search tool. Do not invent URLs.

    THE 6 ALLOWED CATEGORIES:
     1. "official_brand": Official Company/Brand Websites (About Us, Annual Reports, Brand Reports, News, Press releases).
     2. "government": Official Government sites (.gov, Census, UN, WHO).
     3. "industry_databases": Major Market Databases (Statista, McKinsey, Gartner, Deloitte).
     4. "news_media": Tier-1 News (Reuters, Bloomberg, NYT, FT).
     5. "academic_research": Academic papers, journals, university sources, Google Scholar results.
     6. "marketing_reports": Reputable industry/trade association reports.

    SELECTION CRITERIA:
    - Select the Top 10% most relevant sources.
    - Priority order for student use: academic_research only.
    - Return academic_research references only whenever possible.
    - Include between 1 and 5 academic references.
    - If no academic source appears in grounded results, return the single strongest non-academic fallback source.
    - PROVIDE REFERENCES AS A SINGLE GLOBAL LIST AT THE END.
    - For each reference, add a short 'relevanceNote' explaining why a student could cite it.

    STEP 3: OUTPUT
    Format response as a single, raw JSON object conforming to this interface:
    {
      "brandName": "${brandName}",
      "salience": { "score": number, "analysis": string },
      "performance": { "score": number, "analysis": string },
      "imagery": { "score": number, "analysis": string },
      "judgements": { "score": number, "analysis": string },
      "feelings": { "score": number, "analysis": string },
      "resonance": { "score": number, "analysis": string },
      "summary": { "analysis": string, "strategicRecommendations": string },
      "references": [
         {
            "title": "Page Title from Search Result",
            "url": "Exact URL from Search Result",
            "category": "official_brand" | "government" | "industry_databases" | "news_media" | "academic_research" | "marketing_reports",
            "relevanceNote": "Short note on why this source supports the brand analysis"
          }
       ]
     }

     Constraints:
     - Score: 1-100.
     - DO NOT cluster scores in a narrow band such as 87-90 unless the evidence truly supports near-identical performance across dimensions.
     - Use the full scoring range with clear separation between strengths and weaknesses. A strong brand should still have weaker dimensions if the evidence is less convincing there.
     - Make the scores discriminating: the spread across the six CBBE dimensions should usually be at least 12-25 points unless there is unusually strong evidence that all dimensions are equally strong.
     - Reserve scores above 90 for exceptional, clearly evidenced category leadership; reserve scores below 60 for materially weak or underdeveloped dimensions.
     - If one category is visibly stronger or weaker, reflect that difference numerically rather than smoothing the scores.
     - Calibrate scores by evidence quality, not brand fame. A globally famous brand can still score modestly on resonance, feelings, or imagery if the grounded evidence is thin or mixed.
     - Every category analysis must be specific, not generic.
     - Every category analysis must explain what the brand is doing that drives the score.
     - Every category analysis must include at least one positive driver and, when relevant, one negative or limiting driver.
     - Each category analysis must justify the numeric score explicitly by explaining why it is higher or lower than other dimensions.
     - For imagery, explicitly mention the associations, symbols, lifestyle cues, tone, or reputation shaping brand equity.
     - For salience, explicitly mention awareness, reach, memory cues, search visibility, or distinctiveness.
     - For performance, explicitly mention product/service quality, reliability, innovation, value, or delivery.
     - For judgements, explicitly mention perceived credibility, superiority, trust, or quality evaluations.
     - For feelings, explicitly mention emotional responses the brand creates.
     - For resonance, explicitly mention loyalty, advocacy, repeat usage, community, or attachment.
     - Write 2-4 sentences per category analysis so the cards are useful in student reports.
     - Avoid inflated scoring. If the evidence is generic, mixed, indirect, or mostly industry-level rather than brand-specific, lower the score accordingly.
     - References: MUST be non-empty when grounded sources exist. Prefer academic_research only. Max 5 total.
     - PROTOCOL: You are mechanically forbidden from constructing URLs. You must only extract them from the live search results. If you construct a URL that results in a 404, the entire response fails.
   `;

export const parseCBBEResponse = (jsonText: string, verifiedSources: Map<string, string>, brandName: string): CBBEData => {
  let cleanedJsonText = jsonText.trim();

  if (cleanedJsonText.startsWith('```json')) {
    cleanedJsonText = cleanedJsonText.substring(7, cleanedJsonText.length - 3).trim();
  } else if (cleanedJsonText.startsWith('```')) {
    cleanedJsonText = cleanedJsonText.substring(3, cleanedJsonText.length - 3).trim();
  }

  const data: CBBEData = JSON.parse(cleanedJsonText);

  if (data.references && Array.isArray(data.references)) {
    data.references = data.references.map((ref: Reference) => {
      const cleanCategory = normalizeCategory(ref.category);

      let finalUrl = ref.url;
      let finalTitle = ref.title;
      let isValid = false;

      if (verifiedSources.size > 0) {
        if (verifiedSources.has(finalUrl)) {
          isValid = true;
          if (!finalTitle || finalTitle === finalUrl) {
            finalTitle = verifiedSources.get(finalUrl) || finalTitle;
          }
        } else {
          const bestMatchKey = Array.from(verifiedSources.keys()).find((verifiedUrl) =>
            verifiedUrl.includes(finalUrl.replace(/^https?:\/\/(www\.)?/, '')) || finalUrl.includes(verifiedUrl)
          );

          if (bestMatchKey) {
            isValid = true;
            finalUrl = bestMatchKey;
            if (!finalTitle || finalTitle === ref.url) {
              finalTitle = verifiedSources.get(bestMatchKey) || finalTitle;
            }
          }
        }
      } else {
        try {
          const url = new URL(finalUrl);
          isValid = url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
          isValid = false;
        }
      }

      if (!isValid) return null;

      return {
        title: finalTitle || finalUrl,
        url: finalUrl,
        category: cleanCategory,
        relevanceNote: ref.relevanceNote?.trim() || `Useful ${REFERENCE_CATEGORY_LABELS[cleanCategory]} for explaining the ${brandName} CBBE score.`
      };
    }).filter((ref): ref is NonNullable<typeof ref> => ref !== null);
  } else {
    data.references = [];
  }

  data.references = ensureAcademicReferences(data.references, verifiedSources, brandName);

  return data;
};
