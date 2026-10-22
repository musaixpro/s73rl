export type StyleFamily =
  | 'classic_hip_hop'
  | 'boom_bap'
  | 'trap'
  | 'drill'
  | 'phonk'
  | 'g_funk'
  | 'dark_rap'
  | 'melodic_rap'
  | 'emo_rap'
  | 'conscious_rap'
  | 'regional_rap'
  | 'lofi_rap'
  | 'experimental_rap'
  | 'fusion_rap';

export type TargetPlatform =
  | 'suno'
  | 'udio'
  | 'musicgen'
  | 'producer_brief'
  | 'local_pipeline';

export interface StyleVocabularyEntry {
  style_id: string;
  style_name: string;
  style_family: StyleFamily;
  region: string;
  era: string;
  tempo_min: number;
  tempo_max: number;
  energy: string;
  mood: string[];
  vocal_delivery: string[];
  drums: string[];
  bass: string[];
  instrumentation: string[];
  mix_texture: string;
  platform_hint: string;
  exclude_styles: string[];
  quality_score: number;
  tags: string[];
  notes: string;
}

export interface ProjectPreset {
  preset_id: string;
  display_name: string;
  tagline: string;
  default_family: StyleFamily;
  style_name: string;
  region: string;
  era: string;
  tempo: number;
  energy: string;
  mood: string;
  drums: string;
  bass: string;
  instrumentation: string;
  vocal_delivery: string;
  song_section_focus: string;
  mix_texture: string;
  exclude_styles: string;
  canonical_prompt: string;
}

export interface PromptBuildInput {
  intent?: string;
  preset_id?: string;
  style_family: StyleFamily;
  style_name: string;
  region: string;
  era: string;
  tempo?: number;
  energy: string;
  mood: string;
  drums: string;
  bass: string;
  instrumentation: string;
  vocal_delivery: string;
  song_section_focus?: string;
  mix_texture: string;
  exclude_styles?: string;
  platform: TargetPlatform;
  formula_mode: 'base' | 'expanded' | 'full';
  instrumental: boolean;
  duration?: number;
}

export interface ScoreBreakdownItem {
  category: string;
  points: number;
  maxPoints: number;
  passed: boolean;
  detail: string;
}

export interface PromptScoreResult {
  score: number;
  breakdown: ScoreBreakdownItem[];
  issues: string[];
  weakTermsFound: string[];
  conflictsFound: string[];
  validationChecklist: {
    label: string;
    checked: boolean;
  }[];
  suggested_prompt: string;
}

export interface BuiltPromptOutput {
  prompt: string;
  exclude_styles: string;
  score: number;
  family: StyleFamily;
  platform: TargetPlatform;
  formula_mode: 'base' | 'expanded' | 'full';
  scoreDetails: PromptScoreResult;
  adapterOutput: {
    sunoStylePrompt: string;
    udioPrompt: string;
    musicgenDescription: string;
    producerSessionBrief: string;
    localPipelinePayload: {
      prompt: string;
      exclude_styles: string;
      duration: number;
      instrumental: boolean;
      bpm: number;
      family: StyleFamily;
    };
  };
  notes: string[];
}

export const STYLE_FAMILIES: { id: StyleFamily; label: string; description: string }[] = [
  { id: 'boom_bap', label: 'Boom Bap', description: 'Sample-driven drums, crisp snares, golden era grit' },
  { id: 'trap', label: 'Trap', description: 'Booming 808 sub bass, rolling hi-hats, cinematic synths' },
  { id: 'drill', label: 'Drill', description: 'Sliding 808 glides, syncopated snare patterns, cold street tension' },
  { id: 'phonk', label: 'Phonk', description: 'Memphis cassette grit, cowbell melodies, distorted low-end' },
  { id: 'classic_hip_hop', label: 'Classic Hip-Hop', description: 'Golden age breaks, turntablism, warm vinyl groove' },
  { id: 'g_funk', label: 'G-Funk', description: 'West Coast portamento synth leads, deep funk bassline' },
  { id: 'dark_rap', label: 'Dark Rap', description: 'Minor-key piano, gothic choir textures, menacing atmosphere' },
  { id: 'melodic_rap', label: 'Melodic Rap', description: 'Pitch-corrected vocal melodies, lush chords, modern bounce' },
  { id: 'emo_rap', label: 'Emo Rap', description: 'Reverb-drenched guitar loops, introspective vocal delivery' },
  { id: 'conscious_rap', label: 'Conscious Rap', description: 'Soulful gospel/jazz chords, warm organic percussion, lyric focus' },
  { id: 'regional_rap', label: 'Regional Rap', description: 'Scene-specific bounce from Detroit, Houston, Atlanta, or Bay Area' },
  { id: 'lofi_rap', label: 'Lo-Fi Rap', description: 'Dusty tape warble, relaxed swing drums, Rhodes chords' },
  { id: 'experimental_rap', label: 'Experimental Rap', description: 'Glitch textures, industrial percussion, unconventional structure' },
  { id: 'fusion_rap', label: 'Fusion Rap', description: 'Cross-genre hybrids blending jazz, soul, rock, or R&B' },
];

export const DEFAULT_EXCLUSIONS_BY_FAMILY: Record<StyleFamily, string> = {
  boom_bap: 'EDM drop, hyperpop, country, polished pop vocals, tropical house',
  classic_hip_hop: 'EDM festival drop, hyperpop, bro-country, bubblegum pop',
  trap: "happy pop, acoustic folk, bright dance pop, children's music, upbeat reggae",
  drill: 'lo-fi chillhop, soft acoustic ballad, funk pop, reggae, country rock',
  phonk: "bright bubblegum pop, acoustic folk, orchestral ballad, children's music",
  g_funk: 'heavy metal, industrial noise, hyperpop, harsh screaming',
  dark_rap: "happy pop, acoustic folk, bright dance pop, children's music, upbeat reggae",
  melodic_rap: 'harsh noise, polka, traditional marching band, thrash metal',
  emo_rap: 'upbeat party EDM, tropical house, comedy novelty song, brass fanfare',
  conscious_rap: 'violent horrorcore, club EDM, novelty rap, comedy vocals, bubblegum pop',
  regional_rap: "tropical house, children's music, classical opera, eurodance",
  lofi_rap: 'aggressive festival EDM drop, screaming metal vocals, harsh industrial distortion',
  experimental_rap: 'generic corporate ukulele, adult contemporary ballad, country pop',
  fusion_rap: "children's music, generic elevator muzak, novelty comedy vocals",
};

export const PROJECT_PRESETS: ProjectPreset[] = [
  {
    preset_id: 'cold_case',
    display_name: 'Cold Case',
    tagline: '90s East Coast detective noir boom bap',
    default_family: 'boom_bap',
    style_name: 'dark East Coast boom bap',
    region: 'East Coast',
    era: '90s',
    tempo: 92,
    energy: 'dark',
    mood: 'cold case detective atmosphere',
    drums: 'punchy kick and snare',
    bass: 'walking bassline',
    instrumentation: 'dusty vinyl jazz sample',
    vocal_delivery: 'gritty male storytelling rap',
    song_section_focus: 'narrative verse focus',
    mix_texture: 'raw analog mix',
    exclude_styles: 'EDM drop, hyperpop, country, polished pop vocals, tropical house',
    canonical_prompt:
      'dark East Coast boom bap, dusty vinyl jazz sample, punchy kick and snare, walking bassline, gritty male storytelling rap, cold case detective atmosphere, raw analog mix',
  },
  {
    preset_id: 'blue_king',
    display_name: 'Blue King',
    tagline: 'Royal legacy orchestral street anthem',
    default_family: 'trap',
    style_name: 'orchestral trap rap',
    region: 'Atlanta',
    era: 'modern',
    tempo: 140,
    energy: 'luxury',
    mood: 'royal legacy mood',
    drums: 'crisp rolling trap hi-hats and hard snare',
    bass: 'booming 808 sub bass',
    instrumentation: 'dramatic strings, dark piano chords',
    vocal_delivery: 'confident male melodic rap',
    song_section_focus: 'anthemic hook and verse',
    mix_texture: 'cinematic street anthem mix',
    exclude_styles: "happy pop, acoustic folk, bright dance pop, children's music, upbeat reggae",
    canonical_prompt:
      'orchestral trap rap, booming 808 sub bass, dramatic strings, dark piano chords, confident male melodic rap, royal legacy mood, cinematic street anthem mix',
  },
  {
    preset_id: 'rabbit_skin',
    display_name: 'Rabbit Skin',
    tagline: 'Haunted backwoods gothic trap',
    default_family: 'dark_rap',
    style_name: 'gothic rap',
    region: 'Memphis',
    era: 'modern',
    tempo: 134,
    energy: 'dark',
    mood: 'haunted backwoods atmosphere',
    drums: 'heavy trap drums',
    bass: 'distorted 808 bass',
    instrumentation: 'eerie choir pads',
    vocal_delivery: 'raspy male rap vocals',
    song_section_focus: 'tense intro and aggressive verse',
    mix_texture: 'dark cinematic mix',
    exclude_styles: "happy pop, acoustic folk, bright dance pop, children's music, upbeat reggae",
    canonical_prompt:
      'gothic rap, eerie choir pads, heavy trap drums, distorted 808 bass, raspy male rap vocals, haunted backwoods atmosphere, dark cinematic mix',
  },
  {
    preset_id: 'gas_fee',
    display_name: 'Gas Fee',
    tagline: 'Luxury tech hustle Atlanta club trap',
    default_family: 'trap',
    style_name: 'modern Atlanta trap rap',
    region: 'Atlanta',
    era: 'modern',
    tempo: 146,
    energy: 'luxury',
    mood: 'luxury tech hustle mood',
    drums: 'crisp hi-hats',
    bass: 'deep 808 bass',
    instrumentation: 'icy synth bells',
    vocal_delivery: 'melodic autotune hook',
    song_section_focus: 'catchy melodic hook',
    mix_texture: 'polished club mix',
    exclude_styles: "acoustic folk, country ballad, children's music, vintage jazz",
    canonical_prompt:
      'modern Atlanta trap rap, crisp hi-hats, deep 808 bass, icy synth bells, melodic autotune hook, luxury tech hustle mood, polished club mix',
  },
  {
    preset_id: 'sacred_sin',
    display_name: 'Sacred Sin',
    tagline: 'Redemption and regret gospel boom bap',
    default_family: 'conscious_rap',
    style_name: 'spiritual conscious rap',
    region: 'Chicago',
    era: '2000s',
    tempo: 88,
    energy: 'emotional',
    mood: 'redemption and regret atmosphere',
    drums: 'warm boom bap drums',
    bass: 'deep bass',
    instrumentation: 'soulful gospel chords',
    vocal_delivery: 'emotional male rap vocals',
    song_section_focus: 'confessional storytelling verse',
    mix_texture: 'intimate analog mix',
    exclude_styles: 'violent horrorcore, club EDM, novelty rap, comedy vocals, bubblegum pop',
    canonical_prompt:
      'spiritual conscious rap, soulful gospel chords, warm boom bap drums, deep bass, emotional male rap vocals, redemption and regret atmosphere, intimate analog mix',
  },
  {
    preset_id: 'ethereum_chain_talk',
    display_name: 'Ethereum Chain Talk',
    tagline: 'Futuristic neon synth arpeggio trap',
    default_family: 'trap',
    style_name: 'futuristic trap rap',
    region: 'Atlanta',
    era: 'modern',
    tempo: 142,
    energy: 'aggressive',
    mood: 'crypto-night hustle atmosphere',
    drums: 'crisp 808 drums',
    bass: 'deep sub bass',
    instrumentation: 'digital synth arpeggios',
    vocal_delivery: 'confident melodic rap vocals',
    song_section_focus: 'high-energy verse and hook',
    mix_texture: 'polished neon mix',
    exclude_styles: "acoustic folk, country rock, children's music, traditional blues",
    canonical_prompt:
      'futuristic trap rap, digital synth arpeggios, crisp 808 drums, deep sub bass, confident melodic rap vocals, crypto-night hustle atmosphere, polished neon mix',
  },
];

export const INITIAL_STYLE_VOCABULARY: StyleVocabularyEntry[] = [
  {
    style_id: 'boom_bap_ny_90s',
    style_name: 'East Coast boom bap',
    style_family: 'boom_bap',
    region: 'East Coast',
    era: '90s',
    tempo_min: 86,
    tempo_max: 96,
    energy: 'dark',
    mood: ['cold city night atmosphere', 'underground', 'gritty'],
    vocal_delivery: ['gritty male storytelling rap', 'lyrical multisyllabic flow'],
    drums: ['punchy kick and snare', 'MPC swing boom bap drums'],
    bass: ['warm upright bass', 'walking bassline'],
    instrumentation: ['dusty vinyl soul sample', 'jazzy Rhodes loop'],
    mix_texture: 'raw analog mix',
    platform_hint: 'Suno / Udio / MusicGen',
    exclude_styles: ['EDM drop', 'hyperpop', 'country', 'tropical house'],
    quality_score: 97,
    tags: ['boom bap', 'east coast', '90s', 'vinyl', 'storytelling'],
    notes: 'Golden-era New York sample aesthetic with unquantized drum swing.',
  },
  {
    style_id: 'trap_memphis_dark',
    style_name: 'dark Memphis trap',
    style_family: 'trap',
    region: 'Memphis',
    era: 'modern',
    tempo_min: 130,
    tempo_max: 150,
    energy: 'aggressive',
    mood: ['gritty street atmosphere', 'dark', 'haunted'],
    vocal_delivery: ['aggressive male rap vocals', 'triplet flow'],
    drums: ['crisp triplet hi-hats', 'hard punchy snare'],
    bass: ['heavy 808 sub bass'],
    instrumentation: ['haunting piano loop', 'dark minor strings'],
    mix_texture: 'cinematic mix',
    platform_hint: 'Suno / Udio',
    exclude_styles: ['happy pop', 'acoustic folk', 'tropical house'],
    quality_score: 95,
    tags: ['trap', 'memphis', 'dark', '808', 'triplet'],
    notes: 'High-tension minor piano melodies over booming sub-bass.',
  },
  {
    style_id: 'drill_uk_dark',
    style_name: 'UK drill',
    style_family: 'drill',
    region: 'UK',
    era: 'modern',
    tempo_min: 140,
    tempo_max: 146,
    energy: 'aggressive',
    mood: ['cold urban tension', 'nocturnal street atmosphere'],
    vocal_delivery: ['aggressive baritone drill flow', 'syncopated UK pocket'],
    drums: ['syncopated drill hi-hats', 'snappy rimshot snare'],
    bass: ['sliding 808 glides'],
    instrumentation: ['minor orchestral string loop', 'reversed dark piano'],
    mix_texture: 'punchy low-end master',
    platform_hint: 'Suno / Udio / Stable Audio',
    exclude_styles: ['lo-fi chillhop', 'soft acoustic ballad', 'funk pop', 'reggae'],
    quality_score: 96,
    tags: ['drill', 'uk', 'sliding 808', 'strings'],
    notes: 'Signature 3-3-2 hi-hat cadence and wide pitch-gliding 808 bass.',
  },
  {
    style_id: 'phonk_memphis_tape',
    style_name: 'Memphis phonk',
    style_family: 'phonk',
    region: 'Memphis',
    era: '90s',
    tempo_min: 115,
    tempo_max: 145,
    energy: 'dark',
    mood: ['haunted', 'underground', 'nocturnal drift'],
    vocal_delivery: ['pitched-down Memphis vocal chop', 'low raspy flow'],
    drums: ['lo-fi 808 cowbell percussion', 'crunchy tape trap drums'],
    bass: ['distorted 808 bass'],
    instrumentation: ['808 cowbell melody', 'eerie synth lead'],
    mix_texture: 'gritty underground cassette',
    platform_hint: 'Suno / MusicGen',
    exclude_styles: ['bright pop', 'acoustic folk', 'clean orchestral'],
    quality_score: 94,
    tags: ['phonk', 'memphis', 'cowbell', 'cassette'],
    notes: 'Four-track tape saturation with iconic cowbell lead.',
  },
  {
    style_id: 'gfunk_west_coast_90s',
    style_name: 'West Coast G-Funk',
    style_family: 'g_funk',
    region: 'West Coast',
    era: '90s',
    tempo_min: 90,
    tempo_max: 100,
    energy: 'chill',
    mood: ['sun-drenched boulevard cruise', 'confident laid-back groove'],
    vocal_delivery: ['smooth West Coast cadence', 'talkbox hook vocals'],
    drums: ['laid-back crisp West Coast clap and kick'],
    bass: ['deep rubbery Moog synth bassline'],
    instrumentation: ['high-pitched portamento synth lead', 'funk electric guitar wah'],
    mix_texture: 'warm analog studio mix',
    platform_hint: 'Suno / Udio',
    exclude_styles: ['industrial metal', 'hyperpop', 'drill'],
    quality_score: 96,
    tags: ['g-funk', 'west coast', '90s', 'talkbox', 'moog'],
    notes: 'Classic California parliament-funk synthesis and high-sine whistle leads.',
  },
  {
    style_id: 'trap_atlanta_luxury',
    style_name: 'Atlanta luxury trap',
    style_family: 'trap',
    region: 'Atlanta',
    era: 'modern',
    tempo_min: 136,
    tempo_max: 152,
    energy: 'luxury',
    mood: ['penthouse victory atmosphere', 'high-roller nocturnal'],
    vocal_delivery: ['melodic autotune hook', 'confident triplet verse'],
    drums: ['crisp fast-roll hi-hats', 'tight clap'],
    bass: ['deep tuned 808 sub bass'],
    instrumentation: ['icy synth bells', 'lush ambient pad'],
    mix_texture: 'polished club mix',
    platform_hint: 'Suno / Udio',
    exclude_styles: ['acoustic folk', 'country', 'raw punk'],
    quality_score: 95,
    tags: ['atlanta', 'trap', 'luxury', 'autotune'],
    notes: 'Wide stereo imaging with pristine sub-bass translation.',
  },
  {
    style_id: 'regional_detroit_bounce',
    style_name: 'Detroit street rap',
    style_family: 'regional_rap',
    region: 'Detroit',
    era: 'modern',
    tempo_min: 175,
    tempo_max: 195,
    energy: 'aggressive',
    mood: ['relentless street urgency', 'off-kilter dark humor'],
    vocal_delivery: ['conversational punchline flow', 'Slightly behind-the-beat delivery'],
    drums: ['fast snappy Detroit rimshot and tamborine bounce'],
    bass: ['short punchy 808 synth bass'],
    instrumentation: ['urgent minor staccato piano loop', 'tense pizzicato strings'],
    mix_texture: 'dry upfront punchy mix',
    platform_hint: 'Suno / Udio',
    exclude_styles: ['slow ballad', 'tropical house', 'ambient drone'],
    quality_score: 95,
    tags: ['detroit', 'piano', 'up-tempo', 'regional'],
    notes: 'Fast-paced urgent piano loops with distinct synth-bass bounce.',
  },
  {
    style_id: 'conscious_jazz_rap',
    style_name: 'conscious jazz rap',
    style_family: 'conscious_rap',
    region: 'Chicago',
    era: '2000s',
    tempo_min: 84,
    tempo_max: 94,
    energy: 'emotional',
    mood: ['introspective late-night coffeehouse', 'soulful warmth'],
    vocal_delivery: ['poetic articulate rap flow', 'neo-soul background harmonies'],
    drums: ['brushed live jazz snare and warm kick'],
    bass: ['melodic fretless electric bass'],
    instrumentation: ['muted Miles-style trumpet', 'warm Fender Rhodes chords'],
    mix_texture: 'intimate warm tape mix',
    platform_hint: 'Suno / Udio / MusicGen',
    exclude_styles: ['violent horrorcore', 'club EDM', 'hyperpop'],
    quality_score: 96,
    tags: ['jazz rap', 'conscious', 'chicago', 'rhodes', 'trumpet'],
    notes: 'Live-instrument warmth with spacious headroom for lyricism.',
  },
  {
    style_id: 'emo_melodic_guitar',
    style_name: 'emo trap ballad',
    style_family: 'emo_rap',
    region: 'East Coast',
    era: '2010s',
    tempo_min: 125,
    tempo_max: 145,
    energy: 'emotional',
    mood: ['heartbreak and late-night solitude', 'melancholic catharsis'],
    vocal_delivery: ['layered melodic emo-rap vocals', 'strained emotional hook'],
    drums: ['crisp trap hi-hats with rock snare layer'],
    bass: ['warm saturated 808 bass'],
    instrumentation: ['chorus-drenched clean electric guitar arpeggio'],
    mix_texture: 'spacious atmospheric reverb mix',
    platform_hint: 'Suno / Udio',
    exclude_styles: ['upbeat party club', 'comedy novelty', 'funk brass'],
    quality_score: 94,
    tags: ['emo rap', 'guitar', 'melodic', '2010s'],
    notes: 'Clean midwest-emo inspired guitar loop paired with modern 808 percussion.',
  },
  {
    style_id: 'drill_brooklyn_sample',
    style_name: 'Brooklyn sample drill',
    style_family: 'drill',
    region: 'East Coast',
    era: 'modern',
    tempo_min: 142,
    tempo_max: 148,
    energy: 'aggressive',
    mood: ['high-voltage borough energy', 'gritty street celebration'],
    vocal_delivery: ['raspy energetic Brooklyn drill cadence'],
    drums: ['stutter-step New York drill hi-hats and hard snare'],
    bass: ['aggressive sliding 808 sub bass'],
    instrumentation: ['pitched-up soulful vocal sample chop'],
    mix_texture: 'loud club-ready master',
    platform_hint: 'Suno / Udio',
    exclude_styles: ['soft acoustic folk', 'country', 'ambient lullaby'],
    quality_score: 95,
    tags: ['brooklyn drill', 'sample drill', 'new york', 'sliding 808'],
    notes: 'Pitched R&B/pop vocal sample juxtaposed against aggressive drill percussion.',
  },
];

const WEAK_ALONE_TERMS = [
  'rap',
  'hip-hop',
  'beat',
  'song',
  'urban',
  'cool',
  'modern',
  'hard',
  'dark',
  'vibe',
];

const CONFLICT_PAIRS: [RegExp, RegExp, string][] = [
  [/lo-?fi|raw analog|cassette/i, /edm festival drop|polished edm|big room drop/i, 'Lo-fi raw analog conflicts with polished EDM festival drop'],
  [/horrorcore|gothic|occult/i, /happy children|bubblegum|upbeat kids/i, "Dark horrorcore/gothic conflicts with happy children's music"],
  [/90s boom bap|golden age/i, /hyperpop|bubblegum synth/i, '90s boom bap conflicts with hyperpop bubblegum synths'],
  [/acoustic folk ballad/i, /heavy drill 808|sliding 808/i, 'Acoustic folk ballad conflicts with heavy drill 808s'],
];

const SUBGENRE_KEYWORDS = [
  'boom bap',
  'trap',
  'drill',
  'phonk',
  'g-funk',
  'horrorcore',
  'jazz rap',
  'conscious',
  'emo rap',
  'melodic rap',
  'gothic rap',
  'cloud rap',
  'chopper',
  'crunk',
  'hyphy',
  'lo-fi rap',
  'detroit rap',
];

const REGION_ERA_KEYWORDS = [
  'memphis',
  'atlanta',
  'east coast',
  'west coast',
  'new york',
  'brooklyn',
  'chicago',
  'detroit',
  'houston',
  'uk',
  'london',
  'toronto',
  'bay area',
  '90s',
  '80s',
  '2000s',
  '2010s',
  'modern',
  'golden age',
  'old school',
  'futuristic',
];

const DRUM_KEYWORDS = [
  'drum',
  'kick',
  'snare',
  'hi-hat',
  'hat',
  'percussion',
  'breakbeat',
  'rimshot',
  'clap',
  'cowbell',
  'boom bap',
];

const BASS_KEYWORDS = [
  '808',
  'bass',
  'sub',
  'upright',
  'moog',
  'low-end',
  'glide',
];

const INSTRUMENT_KEYWORDS = [
  'piano',
  'sample',
  'strings',
  'synth',
  'guitar',
  'rhodes',
  'choir',
  'bells',
  'pad',
  'horn',
  'trumpet',
  'flute',
  'violin',
  'arpeggio',
  'chords',
  'vinyl',
  'melody',
  'loop',
];

const VOCAL_KEYWORDS = [
  'vocal',
  'rap',
  'flow',
  'hook',
  'storytelling',
  'autotune',
  'baritone',
  'raspy',
  'delivery',
  'cadence',
  'chopper',
  'instrumental',
];

const MOOD_KEYWORDS = [
  'atmosphere',
  'mood',
  'noir',
  'gritty',
  'haunted',
  'cinematic',
  'street',
  'luxury',
  'redemption',
  'regret',
  'tension',
  'emotional',
  'night',
  'underground',
  'royal',
  'hustle',
  'cold case',
  'melancholic',
  'introspective',
];

const MIX_KEYWORDS = [
  'mix',
  'master',
  'analog',
  'cassette',
  'polished',
  'tape',
  'reverb',
  'club',
  'lo-fi',
];

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

export function scorePrompt(promptText: string, excludeStylesText = ''): PromptScoreResult {
  const normalized = promptText.trim();
  const lower = normalized.toLowerCase();
  const words = lower.replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);

  const hasSubgenre = containsAny(lower, SUBGENRE_KEYWORDS);
  const hasRegionOrEra = containsAny(lower, REGION_ERA_KEYWORDS);
  const hasDrums = containsAny(lower, DRUM_KEYWORDS);
  const hasBass = containsAny(lower, BASS_KEYWORDS);
  const hasInstrumentation = containsAny(lower, INSTRUMENT_KEYWORDS);
  const hasVocal = containsAny(lower, VOCAL_KEYWORDS) && words.length > 3;
  const hasMood = containsAny(lower, MOOD_KEYWORDS);
  const hasMix = containsAny(lower, MIX_KEYWORDS);

  const conflictsFound: string[] = [];
  for (const [regA, regB, reason] of CONFLICT_PAIRS) {
    if (regA.test(lower) && regB.test(lower)) {
      conflictsFound.push(reason);
    }
  }
  const hasNoConflicts = conflictsFound.length === 0 && words.length > 0;

  const weakTermsFound = words.filter((w) => WEAK_ALONE_TERMS.includes(w));
  const isWeakOnly = words.length <= 4 && !hasDrums && !hasBass && !hasInstrumentation;

  const breakdown: ScoreBreakdownItem[] = [
    {
      category: 'Specific subgenre',
      points: hasSubgenre ? 15 : 0,
      maxPoints: 15,
      passed: hasSubgenre,
      detail: hasSubgenre
        ? 'Concrete rap subgenre detected'
        : 'Add a specific subgenre (e.g., boom bap, dark Memphis trap, UK drill)',
    },
    {
      category: 'Region or era included',
      points: hasRegionOrEra ? 10 : 0,
      maxPoints: 10,
      passed: hasRegionOrEra,
      detail: hasRegionOrEra
        ? 'Geographic scene or production era anchored'
        : 'Specify region or era (e.g., 90s East Coast, modern Atlanta, Memphis)',
    },
    {
      category: 'Drums specified',
      points: hasDrums ? 10 : 0,
      maxPoints: 10,
      passed: hasDrums,
      detail: hasDrums
        ? 'Drum pattern or percussion texture defined'
        : 'Specify drum identity (e.g., crisp triplet hi-hats, punchy kick and snare)',
    },
    {
      category: 'Bass specified',
      points: hasBass ? 10 : 0,
      maxPoints: 10,
      passed: hasBass,
      detail: hasBass
        ? 'Low-end / 808 / bassline architecture defined'
        : 'Specify bass identity (e.g., heavy 808 sub bass, walking bassline)',
    },
    {
      category: 'Instrumentation specified',
      points: hasInstrumentation ? 15 : 0,
      maxPoints: 15,
      passed: hasInstrumentation,
      detail: hasInstrumentation
        ? 'Harmonic sample or melodic lead palette included'
        : 'Specify harmonic elements (e.g., haunting piano loop, dusty vinyl jazz sample)',
    },
    {
      category: 'Vocal delivery specified',
      points: hasVocal ? 15 : 0,
      maxPoints: 15,
      passed: hasVocal,
      detail: hasVocal
        ? 'Vocal cadence, flow, or explicit instrumental mode defined'
        : 'Specify vocal flow (e.g., gritty male storytelling rap, melodic autotune hook, or instrumental)',
    },
    {
      category: 'Mood specified',
      points: hasMood ? 15 : 0,
      maxPoints: 15,
      passed: hasMood,
      detail: hasMood
        ? 'Emotional or cinematic atmosphere established'
        : 'Specify emotional tone (e.g., gritty street atmosphere, cold case noir)',
    },
    {
      category: 'Mix texture specified',
      points: hasMix ? 5 : 0,
      maxPoints: 5,
      passed: hasMix,
      detail: hasMix
        ? 'Sonic finish / mix character specified'
        : 'Specify mix finish (e.g., raw analog mix, polished club mix, cinematic master)',
    },
    {
      category: 'No conflicting terms',
      points: hasNoConflicts ? 5 : 0,
      maxPoints: 5,
      passed: hasNoConflicts,
      detail: hasNoConflicts
        ? 'Cohesive sonic direction without style contradictions'
        : conflictsFound.join('; '),
    },
  ];

  let totalScore = breakdown.reduce((sum, item) => sum + item.points, 0);
  if (isWeakOnly && totalScore < 20) {
    totalScore = Math.max(totalScore, words.length > 0 ? 15 : 0);
  }

  const issues: string[] = [];
  if (!hasSubgenre) issues.push('Missing specific subgenre');
  if (!hasRegionOrEra) issues.push('Missing region or era context');
  if (!hasDrums) issues.push('Missing drums');
  if (!hasBass) issues.push('Missing bass');
  if (!hasInstrumentation) issues.push('Missing instrumentation');
  if (!hasVocal) issues.push('Missing vocal delivery or instrumental flag');
  if (!hasMood) issues.push('Missing mood');
  if (!hasMix) issues.push('Missing mix texture');
  conflictsFound.forEach((c) => issues.push(`Conflict: ${c}`));

  const validationChecklist = [
    { label: 'Has a specific style or subgenre', checked: hasSubgenre },
    { label: 'Has either region or era', checked: hasRegionOrEra },
    { label: 'Mentions drums', checked: hasDrums },
    { label: 'Mentions bass', checked: hasBass },
    { label: 'Mentions instrumentation', checked: hasInstrumentation },
    { label: 'Mentions vocal delivery or says instrumental', checked: hasVocal },
    { label: 'Mentions mood', checked: hasMood },
    { label: 'Mentions mix texture', checked: hasMix },
    { label: 'Has no obvious conflicts', checked: hasNoConflicts },
    { label: 'Includes exclude styles when platform supports them', checked: excludeStylesText.trim().length > 0 },
  ];

  const suggested_prompt =
    totalScore >= 85
      ? normalized
      : 'modern Memphis dark trap rap, haunting piano loop, crisp triplet hi-hats, heavy 808 sub bass, aggressive male rap vocals, gritty street atmosphere, cinematic mix';

  return {
    score: totalScore,
    breakdown,
    issues,
    weakTermsFound: isWeakOnly ? weakTermsFound : [],
    conflictsFound,
    validationChecklist,
    suggested_prompt,
  };
}

export function buildPrompt(input: PromptBuildInput): BuiltPromptOutput {
  const vocalSegment = input.instrumental
    ? 'instrumental beat, no vocals'
    : input.vocal_delivery.trim();

  const eraRegionStyle = [input.era, input.region, input.style_name]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\b(\w+)\s+\1\b/gi, '$1');

  let assembledPrompt = '';

  if (input.formula_mode === 'base') {
    assembledPrompt = [
      eraRegionStyle,
      input.drums && input.bass ? `${input.drums}, ${input.bass}` : input.drums || input.bass,
      input.instrumentation,
      vocalSegment,
      input.mood,
      input.mix_texture,
    ]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ');
  } else if (input.formula_mode === 'expanded') {
    assembledPrompt = [
      eraRegionStyle,
      input.drums,
      input.bass,
      input.instrumentation,
      vocalSegment,
      input.mood,
      input.mix_texture,
    ]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ');
  } else {
    const tempoPart = input.tempo ? `${input.tempo} BPM` : '';
    const platformHint =
      input.platform === 'suno'
        ? 'Suno V4 ready'
        : input.platform === 'udio'
          ? 'high-fidelity stereo'
          : input.platform === 'musicgen'
            ? 'direct sonic loop'
            : '';

    assembledPrompt = [
      eraRegionStyle,
      tempoPart,
      input.drums,
      input.bass,
      input.instrumentation,
      vocalSegment,
      input.song_section_focus || '',
      input.mood,
      input.mix_texture,
      platformHint,
    ]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ');
  }

  const excludeStyles =
    input.exclude_styles?.trim() || DEFAULT_EXCLUSIONS_BY_FAMILY[input.style_family];

  const scoreDetails = scorePrompt(assembledPrompt, excludeStyles);

  const bpm = input.tempo || 94;
  const sunoStylePrompt = [
    eraRegionStyle,
    input.instrumentation,
    input.drums,
    input.bass,
    vocalSegment,
    input.mood,
    input.mix_texture,
  ]
    .filter(Boolean)
    .join(', ');

  const udioPrompt = `${sunoStylePrompt}, ${bpm} BPM, [Exclude: ${excludeStyles}]`;

  const musicgenDescription = [
    `${input.energy} ${input.style_name} beat`,
    `${bpm} BPM`,
    input.bass,
    input.drums,
    input.instrumentation,
    input.mood,
    input.instrumental ? 'instrumental' : vocalSegment,
  ]
    .filter(Boolean)
    .join(', ');

  const producerSessionBrief = [
    `Tempo: ${bpm} BPM`,
    `Style / Era: ${eraRegionStyle}`,
    `Drums: ${input.drums}`,
    `Bass: ${input.bass}`,
    `Melody / Sample: ${input.instrumentation}`,
    `Vocal Direction: ${vocalSegment}`,
    `Mood: ${input.mood}`,
    `Mix Finish: ${input.mix_texture}`,
    `Exclude / Avoid: ${excludeStyles}`,
  ].join('\n');

  const notes: string[] = [];
  if (scoreDetails.score >= 90) {
    notes.push(
      'Includes region/era, subgenre, instrumentation, drums, bass, vocal delivery, mood, and mix texture.',
    );
    notes.push('Strong production-ready prompt for Suno, Udio, or local text-to-music models.');
  } else {
    notes.push(...scoreDetails.issues.map((i) => `Refinement suggestion: ${i}`));
  }

  return {
    prompt: assembledPrompt,
    exclude_styles: excludeStyles,
    score: scoreDetails.score,
    family: input.style_family,
    platform: input.platform,
    formula_mode: input.formula_mode,
    scoreDetails,
    adapterOutput: {
      sunoStylePrompt,
      udioPrompt,
      musicgenDescription,
      producerSessionBrief,
      localPipelinePayload: {
        prompt: musicgenDescription,
        exclude_styles: excludeStyles,
        duration: input.duration || 30,
        instrumental: input.instrumental,
        bpm,
        family: input.style_family,
      },
    },
    notes,
  };
}

export function classifyAndCleanRawStyles(rawLines: string[]): StyleVocabularyEntry[] {
  const seen = new Set<string>();
  const cleaned: StyleVocabularyEntry[] = [];

  for (const raw of rawLines) {
    const trimmed = raw
      .replace(/^["'\-\d.)\s]+|["'\s]+$/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

    if (!trimmed || seen.has(trimmed) || trimmed.length < 3) continue;
    seen.add(trimmed);

    let family: StyleFamily = 'trap';
    let region = 'Atlanta';
    let era = 'modern';
    let energy = 'dark';
    let tempoMin = 130;
    let tempoMax = 150;
    let drums = 'crisp triplet hi-hats';
    let bass = 'heavy 808 sub bass';
    let instrumentation = 'dark minor piano loop';
    let vocal = 'confident male rap vocals';
    let mood = 'gritty street atmosphere';
    let mix = 'cinematic mix';

    if (trimmed.includes('boom bap') || trimmed.includes('golden age') || trimmed.includes('east coast')) {
      family = 'boom_bap';
      region = 'East Coast';
      era = '90s';
      tempoMin = 86;
      tempoMax = 96;
      drums = 'punchy boom bap kick and snare';
      bass = 'warm upright walking bassline';
      instrumentation = 'dusty vinyl jazz sample';
      vocal = 'gritty storytelling rap flow';
      mood = 'cold city night atmosphere';
      mix = 'raw analog mix';
    } else if (trimmed.includes('drill')) {
      family = 'drill';
      region = trimmed.includes('uk') ? 'UK' : trimmed.includes('chicago') ? 'Chicago' : 'New York';
      era = 'modern';
      tempoMin = 140;
      tempoMax = 146;
      energy = 'aggressive';
      drums = 'syncopated drill hi-hats and snappy snare';
      bass = 'sliding 808 glides';
      instrumentation = 'dark orchestral string loop';
      vocal = 'aggressive drill cadence';
      mood = 'cold street tension';
      mix = 'punchy low-end master';
    } else if (trimmed.includes('phonk') || trimmed.includes('memphis')) {
      family = 'phonk';
      region = 'Memphis';
      era = '90s';
      tempoMin = 120;
      tempoMax = 142;
      energy = 'dark';
      drums = 'lo-fi tape trap drums and cowbell';
      bass = 'distorted 808 bass';
      instrumentation = 'eerie cowbell melody and minor synth';
      vocal = 'pitched-down Memphis vocal chop';
      mood = 'haunted underground atmosphere';
      mix = 'gritty underground cassette';
    } else if (trimmed.includes('g-funk') || trimmed.includes('west coast')) {
      family = 'g_funk';
      region = 'West Coast';
      era = '90s';
      tempoMin = 90;
      tempoMax = 100;
      energy = 'chill';
      drums = 'laid-back West Coast clap and kick';
      bass = 'deep Moog synth bassline';
      instrumentation = 'high portamento whistle synth lead';
      vocal = 'smooth West Coast cadence';
      mood = 'sun-drenched boulevard atmosphere';
      mix = 'warm analog studio mix';
    } else if (trimmed.includes('emo') || trimmed.includes('sad') || trimmed.includes('pain') || trimmed.includes('heartbreak')) {
      family = 'emo_rap';
      region = 'East Coast';
      era = '2010s';
      tempoMin = 125;
      tempoMax = 142;
      energy = 'emotional';
      drums = 'crisp trap hi-hats and punchy snare';
      bass = 'warm saturated 808 bass';
      instrumentation = 'melancholic clean electric guitar loop';
      vocal = 'emotional melodic autotune rap vocals';
      mood = 'late-night heartbreak atmosphere';
      mix = 'spacious reverb mix';
    } else if (trimmed.includes('jazz') || trimmed.includes('conscious') || trimmed.includes('spiritual') || trimmed.includes('soul')) {
      family = 'conscious_rap';
      region = 'Chicago';
      era = '2000s';
      tempoMin = 84;
      tempoMax = 94;
      energy = 'emotional';
      drums = 'warm boom bap drums';
      bass = 'deep melodic electric bass';
      instrumentation = 'soulful gospel and Rhodes chords';
      vocal = 'articulate introspective rap vocals';
      mood = 'redemption and soulful reflection atmosphere';
      mix = 'intimate analog mix';
    } else if (trimmed.includes('horrorcore') || trimmed.includes('gothic') || trimmed.includes('occult') || trimmed.includes('industrial')) {
      family = 'dark_rap';
      region = 'Memphis';
      era = 'modern';
      tempoMin = 130;
      tempoMax = 145;
      energy = 'dark';
      drums = 'heavy industrial trap drums';
      bass = 'heavily distorted 808 bass';
      instrumentation = 'eerie gothic choir pads and dissonant bells';
      vocal = 'raspy aggressive male rap vocals';
      mood = 'haunted backwoods noir atmosphere';
      mix = 'dark cinematic mix';
    } else if (trimmed.includes('detroit') || trimmed.includes('houston') || trimmed.includes('bay area')) {
      family = 'regional_rap';
      region = trimmed.includes('detroit') ? 'Detroit' : trimmed.includes('houston') ? 'Houston' : 'Bay Area';
      era = 'modern';
      tempoMin = trimmed.includes('detroit') ? 180 : 95;
      tempoMax = trimmed.includes('detroit') ? 196 : 110;
      energy = 'aggressive';
      drums = 'snappy regional bounce percussion';
      bass = 'punchy synth 808 bassline';
      instrumentation = 'tense staccato minor piano loop';
      vocal = 'conversational pocket rap flow';
      mood = 'authentic regional street energy';
      mix = 'upfront punchy mix';
    }

    const baselinePrompt = `${era} ${region} ${trimmed}, ${drums}, ${bass}, ${instrumentation}, ${vocal}, ${mood}, ${mix}`;
    const excl = DEFAULT_EXCLUSIONS_BY_FAMILY[family];
    const scored = scorePrompt(baselinePrompt, excl);

    cleaned.push({
      style_id: trimmed.replace(/[^a-z0-9]+/g, '_'),
      style_name: trimmed,
      style_family: family,
      region,
      era,
      tempo_min: tempoMin,
      tempo_max: tempoMax,
      energy,
      mood: [mood],
      vocal_delivery: [vocal],
      drums: [drums],
      bass: [bass],
      instrumentation: [instrumentation],
      mix_texture: mix,
      platform_hint: 'Suno / Udio / MusicGen',
      exclude_styles: excl.split(',').map((s) => s.trim()),
      quality_score: scored.score,
      tags: trimmed.split(' ').filter((w) => w.length > 2),
      notes: `Auto-classified into ${family} (${region}, ${era}).`,
    });
  }

  return cleaned;
}
