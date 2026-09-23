// Realistic mock news and analysis dataset for TruthScan AI

export const MOCK_NEWS = [
  {
    id: "news-1",
    source: "Reuters Science",
    sourceIcon: "🔬",
    category: "Science",
    publishedAt: "12m ago",
    date: "23 Sep 2026",
    headline: "NASA James Webb Telescope Detects Atmospheric Water Vapor on Habitable-Zone Exoplanet K2-18b",
    description: "Astronomers confirm atmospheric signatures consistent with water vapor and possible methane on a sub-Neptune exoplanet 120 light years away.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    verifiedVerdict: "TRUE",
    confidence: 96,
    verdictExplanation: "Confirmed by NASA official press release and published in Astrophysical Journal Letters. Data corroborated by multiple independent spectral analyses.",
    claimAnalyzed: "NASA confirmed evidence of atmospheric water vapor and bio-markers on K2-18b via JWST spectral readings."
  },
  {
    id: "news-2",
    source: "Global News Wire",
    sourceIcon: "⚡",
    category: "Technology",
    publishedAt: "45m ago",
    date: "23 Sep 2026",
    headline: "Viral Post Claims Deepfake Audio Created Fake Banking Emergency Shutting Down Global ATM Networks",
    description: "Circulating social media clips allege synchronized synthetic voice cloning triggered nationwide automated bank runs across three continents.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
    verifiedVerdict: "FALSE",
    confidence: 94,
    verdictExplanation: "Central banks and international monetary authorities confirmed no network outages took place. The viral audio was generated using open-source TTS synthesis.",
    claimAnalyzed: "Deepfake audio triggered widespread emergency shutdowns of global banking ATM systems."
  },
  {
    id: "news-3",
    source: "Policy Review",
    sourceIcon: "🏛️",
    category: "Politics",
    publishedAt: "2h ago",
    date: "23 Sep 2026",
    headline: "New International Treaty Mandates Cryptographic Watermarks on All Generative AI Models",
    description: "European and US regulators propose unified cryptographic provenance standards for foundation models to identify AI synthetic media at scale.",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop",
    verifiedVerdict: "MISLEADING",
    confidence: 88,
    verdictExplanation: "While regulatory drafts exist in committee, no binding international treaty has been ratified. The post misrepresents a preliminary advisory recommendation as finalized global law.",
    claimAnalyzed: "An international treaty has officially legally mandated cryptographic watermarks on all generative AI models."
  },
  {
    id: "news-4",
    source: "Health Dispatch",
    sourceIcon: "🩺",
    category: "Health",
    publishedAt: "3h ago",
    date: "23 Sep 2026",
    headline: "WHO Validates Next-Generation Universal mRNA Vaccine Candidate in Phase 3 Clinical Trials",
    description: "Multicenter trials reveal 91% protective efficacy against multiple mutating viral strains with minimal reported side-effects.",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=800&auto=format&fit=crop",
    verifiedVerdict: "TRUE",
    confidence: 93,
    verdictExplanation: "Peer-reviewed findings published in the Lancet and endorsed by WHO Technical Advisory Group. Phase 3 trial clinical protocols match the reported figures.",
    claimAnalyzed: "Universal mRNA candidate demonstrated 91% efficacy in peer-reviewed Phase 3 trials."
  },
  {
    id: "news-5",
    source: "Climate Watch",
    sourceIcon: "🌍",
    category: "Climate",
    publishedAt: "5h ago",
    date: "23 Sep 2026",
    headline: "Claims Circulate That Arctic Sea Ice Reached Record High Levels in Autumn 2026",
    description: "Blog posts citing unverified satellite screenshots claim Arctic ice extent has completely reversed three decades of seasonal melt.",
    image: "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?q=80&w=800&auto=format&fit=crop",
    verifiedVerdict: "FALSE",
    confidence: 97,
    verdictExplanation: "Data from NSIDC (National Snow and Ice Data Center) and Copernicus show September minimum ice extent remains among the 10 lowest on satellite record.",
    claimAnalyzed: "Arctic sea ice reached unprecedented record highs in September 2026."
  },
  {
    id: "news-6",
    source: "Cyber Intel",
    sourceIcon: "🛡️",
    category: "Technology",
    publishedAt: "7h ago",
    date: "23 Sep 2026",
    headline: "Quantum Computer Decrypts RSA-4096 Key in Under Three Minutes, Alleges Viral Whitepaper",
    description: "A self-published PDF on archive servers claims commercial quantum hardware broke modern public-key cryptography.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
    verifiedVerdict: "UNCERTAIN",
    confidence: 76,
    verdictExplanation: "Independent cryptographers have not been granted access to replicate the alleged benchmark. Current fault-tolerant qubit counts make this claim theoretically suspect pending peer review.",
    claimAnalyzed: "Commercial quantum hardware demonstrated arbitrary factorisation of RSA-4096 keys in 180 seconds."
  }
];

export const MOCK_HISTORY = [
  {
    id: "hist-101",
    input: "NASA discovered extraterrestrial fossils on Martian core samples retrieved by Perseverance.",
    inputType: "TEXT",
    verdict: "FALSE",
    confidence: 94,
    date: "23 Sep 2026",
    source: "Social Post (X/Twitter)",
    explanation: "Perseverance has discovered organic molecules and intriguing rock textures, but NASA has explicitly clarified that no fossils or definitive signs of alien life have been confirmed.",
    metrics: { sourceTrust: 28, consensusScore: 92, evidenceDepth: "High" }
  },
  {
    id: "hist-102",
    input: "https://financialwire-leak.org/articles/fed-rate-drop-emergency-meeting",
    inputType: "URL",
    verdict: "FALSE",
    confidence: 91,
    date: "22 Sep 2026",
    source: "financialwire-leak.org",
    explanation: "The domain is an unverified clone imitating legitimate financial feeds. Federal Reserve scheduled calendars and official transcripts show no emergency meeting occurred.",
    metrics: { sourceTrust: 15, consensusScore: 95, evidenceDepth: "Very High" }
  },
  {
    id: "hist-103",
    input: "image_scan_manifesto_newspaper_clipping.jpg",
    inputType: "FILE",
    verdict: "MISLEADING",
    confidence: 84,
    date: "21 Sep 2026",
    source: "Scanned Print Clipping",
    explanation: "The clipping is from a satirical edition published in 2018, presented without context to appear as a factual 2026 breaking policy announcement.",
    metrics: { sourceTrust: 42, consensusScore: 81, evidenceDepth: "Moderate" }
  },
  {
    id: "hist-104",
    input: "Global renewable energy generation exceeded 30% of total electrical power output in 2025.",
    inputType: "TEXT",
    verdict: "TRUE",
    confidence: 96,
    date: "20 Sep 2026",
    source: "IEA & Ember Energy Report",
    explanation: "Corroborated by the International Energy Agency (IEA) and Ember Global Electricity Review confirming solar and wind expansion surpassed 30% threshold.",
    metrics: { sourceTrust: 96, consensusScore: 98, evidenceDepth: "Extensive" }
  },
  {
    id: "hist-105",
    input: "camera_snapshot_billboard_claim_qr.png",
    inputType: "CAMERA",
    verdict: "FALSE",
    confidence: 89,
    date: "19 Sep 2026",
    source: "Live Camera OCR Scan",
    explanation: "Text captured from promotional flyer promises 400% guaranteed monthly returns using automated neural trading. Classic high-yield investment scam indicators detected.",
    metrics: { sourceTrust: 12, consensusScore: 93, evidenceDepth: "High" }
  }
];

export const MOCK_STATS = {
  totalChecks: 1428,
  trueCount: 412,
  falseCount: 789,
  misleadingCount: 227,
  uncertainCount: 65,
  avgConfidence: "91.4%",
  activeMonitors: 148
};
