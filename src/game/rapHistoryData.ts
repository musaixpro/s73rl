// MIR Rap History & Geography Dataset
// Encompasses historical landmarks, geographic coordinates for Google Maps grounding,
// Music Information Retrieval (MIR) audio features, story chapters, and sonic attributes.

export interface HistoricalLandmark {
  id: string;
  name: string;
  era: string;
  region: string;
  address: string;
  latitude: number;
  longitude: number;
  storyTitle: string;
  storyDescription: string;
  iconicFigures: string[];
  musicalBreakthrough: string;
  mirFeatures: {
    tempoBpm: number;
    meter: string;
    spectralBrightness: string;
    swingRatio: string;
    subBassTuningHz: number;
    harmonicSource: string;
  };
  recommendedPrompt: string;
  excludeStyles: string;
  color: string;
  position3D: [number, number, number]; // [x, y, z] in the 3D game arena
}

export interface CollectableStem {
  id: string;
  type: 'drums' | 'bass' | 'sample' | 'vocal' | 'mix';
  title: string;
  era: string;
  attributeTag: string;
  position3D: [number, number, number];
  landmarkId: string;
  collected?: boolean;
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  narrativeText: string;
  historicalQuote: string;
  speaker: string;
  requiredLandmarkId: string;
  unlockedPromptPreset: string;
}

export const RAP_HISTORY_LANDMARKS: HistoricalLandmark[] = [
  {
    id: 'bronx_1520_sedgwick',
    name: '1520 Sedgwick Ave Rec Room',
    era: '1973 (Birth of Hip-Hop)',
    region: 'The Bronx, NY',
    address: '1520 Sedgwick Ave, Bronx, NY 10453',
    latitude: 40.8468,
    longitude: -73.9242,
    storyTitle: 'The Genesis of The Break',
    storyDescription:
      'On August 11, 1973, Clive Campbell (DJ Kool Herc) hosted his sister Cindy\'s back-to-school party in the recreation room. Isolating the percussive drum break on two identical copies of James Brown records using twin turntables, he invented the "Merry-Go-Round" technique and laid the foundational architecture of hip-hop.',
    iconicFigures: ['DJ Kool Herc', 'Cindy Campbell', 'Coke La Rock'],
    musicalBreakthrough: 'Dual-turntable breakbeat loop extension & unquantized funk drum breaks',
    mirFeatures: {
      tempoBpm: 108,
      meter: '4/4 unquantized funk swing',
      spectralBrightness: 'High acoustic vinyl punch (2.4 kHz snare crack)',
      swingRatio: '58% MPC/Funk human swing',
      subBassTuningHz: 65,
      harmonicSource: 'Incredible Bongo Band / James Brown vinyl breaks',
    },
    recommendedPrompt:
      '1970s Bronx breakbeat hip-hop, 108 BPM, dusty live acoustic funk drum breaks, warm upright bass groove, rhythmic crowd shouts, raw party sound system acoustics',
    excludeStyles: 'modern 808 glides, autotune, EDM synths, hyperpop',
    color: '#F59E0B',
    position3D: [-35, 0, -35],
  },
  {
    id: 'queensbridge_houses',
    name: 'Queensbridge Houses (MPC-60 Lab)',
    era: '1994 (Golden Era Boom Bap)',
    region: 'Queens, New York',
    address: '40-02 Vernon Blvd, Long Island City, NY 11101',
    latitude: 40.7554,
    longitude: -73.9458,
    storyTitle: 'Concrete Noir & 12-Bit Swing',
    storyDescription:
      'The largest public housing complex in North America became a crucible of poetic lyricism. Producers like Marley Marl and Large Professor loaded chopped jazz and blues vinyl samples into Akai MPC-60 and SP-1200 samplers, dropping the pitch for grit and marrying punchy acoustic drums with existential street narrative.',
    iconicFigures: ['Nas', 'Marley Marl', 'Mobb Deep (Havoc & Prodigy)', 'Large Professor'],
    musicalBreakthrough: '12-bit SP-1200 sample chopping, filtered basslines, poetic multisyllabic cadence',
    mirFeatures: {
      tempoBpm: 92,
      meter: '4/4 MPC-60 swing',
      spectralBrightness: 'Warm analog tape roll-off above 8 kHz',
      swingRatio: '54% shuffle',
      subBassTuningHz: 50,
      harmonicSource: 'Dusty vinyl jazz Rhodes, blue-note trumpet, filtered upright bass',
    },
    recommendedPrompt:
      '90s East Coast boom bap, 92 BPM, dusty vinyl jazz sample, punchy kick and snare, walking upright bassline, gritty male storytelling rap, cold city night atmosphere, raw analog mix',
    excludeStyles: 'EDM drop, hyperpop, country, polished pop vocals, tropical house',
    color: '#3B82F6',
    position3D: [35, 0, -35],
  },
  {
    id: 'compton_central_ave',
    name: 'Compton Boulevard & Central Ave',
    era: '1992 (The G-Funk Era)',
    region: 'Compton / West Coast, CA',
    address: 'E Compton Blvd & Central Ave, Compton, CA 90220',
    latitude: 33.8958,
    longitude: -118.2201,
    storyTitle: 'Lowrider Hydraulics & Moog Portamento',
    storyDescription:
      'Dr. Dre and West Coast innovators fused George Clinton\'s P-Funk with slow, hypnotic drum grooves and screeching Moog synthesizer leads. Tuned for hydraulic lowrider sound systems cruising under California palm trees, G-Funk prioritized melodic accessibility and effortless charisma.',
    iconicFigures: ['Dr. Dre', 'Snoop Dogg', 'DJ Quik', 'Warren G'],
    musicalBreakthrough: 'High-sine portamento synth leads, live bass guitar replay, laid-back clap cadence',
    mirFeatures: {
      tempoBpm: 94,
      meter: '4/4 laid-back behind-the-beat',
      spectralBrightness: 'Piercing high-resonance sine lead (6–10 kHz)',
      swingRatio: '52% relaxed groove',
      subBassTuningHz: 42,
      harmonicSource: 'Parliament-Funkadelic interpolated synth chords, wah guitar',
    },
    recommendedPrompt:
      '90s West Coast G-Funk, 94 BPM, deep Moog synth bassline, high-pitched portamento synth lead, laid-back crisp clap and kick, smooth relaxed rap delivery, sun-drenched boulevard cruise, warm analog mix',
    excludeStyles: 'heavy metal, fast drill, hyperpop, acoustic folk, ambient lullaby',
    color: '#10B981',
    position3D: [-35, 0, 35],
  },
  {
    id: 'atlanta_dungeon_family',
    name: 'The Dungeon (Headland and Delowe)',
    era: '2003–2010s (Southern 808 & Trap)',
    region: 'Atlanta, Georgia',
    address: 'Headland Dr SW & Delowe Dr, Atlanta, GA 30311',
    latitude: 33.6933,
    longitude: -84.4539,
    storyTitle: 'The Sub-Bass Monolith',
    storyDescription:
      'From Rico Wade\'s red-dirt basement "Dungeon" to Shawty Redd and Lex Luger\'s home DAWs, Atlanta revolutionized the sonic spectrum by turning the Roland TR-808 kick drum from a rhythmic pulse into a sustained, pitching melodic sub-bass instrument coupled with supersonic 32nd-note rolling hi-hats.',
    iconicFigures: ['Organized Noize / Outkast', 'Shawty Redd', 'Lex Luger', 'Gucci Mane', 'Metro Boomin'],
    musicalBreakthrough: 'Tuned 808 sub basslines, pitch-automated hi-hat rolls, minor orchestral stabs',
    mirFeatures: {
      tempoBpm: 140,
      meter: 'Double-time 4/4 (70 BPM half-time feel)',
      spectralBrightness: 'Crispy sizzle hi-hats (12–16 kHz) over subterranean 30 Hz sub',
      swingRatio: 'Straight 16th and 32nd triplet quantization',
      subBassTuningHz: 36,
      harmonicSource: 'Minor orchestral brass hits, dark synth bells, reversed grand piano',
    },
    recommendedPrompt:
      'modern Atlanta trap rap, 140 BPM, booming 808 sub bass, crisp triplet rolling hi-hats, dramatic minor strings, dark piano loop, confident male melodic rap, cinematic street anthem mix',
    excludeStyles: 'happy pop, acoustic folk, tropical house, children\'s music, upbeat reggae',
    color: '#EF4444',
    position3D: [35, 0, 35],
  },
  {
    id: 'memphis_club_no_name',
    name: 'Memphis Underground Tape Vault',
    era: '1995 (Memphis Phonk & Horrorcore)',
    region: 'Memphis, Tennessee',
    address: 'E.H. Crump Blvd & Third St, Memphis, TN 38126',
    latitude: 35.1322,
    longitude: -90.0543,
    storyTitle: 'Four-Track Cassette Occultism',
    storyDescription:
      'DJ Spanish Fly and Three 6 Mafia recorded DIY cassette tapes characterized by Roland TR-808 cowbells, low-fidelity tape saturation, repetitive hypnotic chant hooks, and chilling minor-key synth pads, birthing the global Phonk phenomenon decades later.',
    iconicFigures: ['Three 6 Mafia (DJ Paul, Juicy J)', 'DJ Spanish Fly', 'Tommy Wright III'],
    musicalBreakthrough: '808 cowbell leads, cassette tape compression, triplet horrorcore cadence',
    mirFeatures: {
      tempoBpm: 132,
      meter: '4/4 hypnotic dark bounce',
      spectralBrightness: 'Lo-fi tape saturation, low-pass filtered sample dirt',
      swingRatio: '53% organic swing',
      subBassTuningHz: 38,
      harmonicSource: 'Eerie 808 cowbell melodies, dissonant synth choir pads',
    },
    recommendedPrompt:
      'dark Memphis phonk rap, 132 BPM, 808 cowbell melody, distorted heavy sub bass, eerie choir pads, pitched-down vocal chops, haunted underground cassette tape mix',
    excludeStyles: 'clean bubblegum pop, EDM drops, country ballad, uplifting acoustic',
    color: '#8B5CF6',
    position3D: [0, 0, -45],
  },
  {
    id: 'london_drill_estates',
    name: 'Brixton & South London Towers',
    era: '2018–Present (UK Drill & Glide Wave)',
    region: 'South London, United Kingdom',
    address: 'Brixton Station Rd, London SW9 8PD, UK',
    latitude: 51.4632,
    longitude: -0.1147,
    storyTitle: 'The Sliding 808 Glides',
    storyDescription:
      'Transplanting Chicago drill rhythms through UK grime sound systems, South London producers introduced pitch-sliding 808 bass glides that leap multiple octaves across syncopated hi-hat patterns (3-3-2 cadence), paired with haunting piano chops and cold urban realism.',
    iconicFigures: ['67', 'Carns Hill', 'Ghostface600', 'M1llionz'],
    musicalBreakthrough: 'Extreme portamento 808 glides, syncopated 3-3-2 hi-hat shuffle, dark sample flips',
    mirFeatures: {
      tempoBpm: 142,
      meter: 'Syncopated drill 4/4 (snare on 3 and 8)',
      spectralBrightness: 'Sharp transient rimshots (3.5 kHz) and dark resonant low-end',
      swingRatio: 'Complex syncopated triplet hi-hat pocket',
      subBassTuningHz: 34,
      harmonicSource: 'Reversed melancholic grand piano chops, cold orchestral cello',
    },
    recommendedPrompt:
      'modern UK drill rap beat, 142 BPM, aggressive sliding 808 glides, syncopated drill hi-hats, snappy rimshot snare, dark reversed piano loop, cold nocturnal street tension, punchy low-end master',
    excludeStyles: 'lo-fi chillhop, soft acoustic ballad, funk pop, bright dancehall',
    color: '#06B6D4',
    position3D: [0, 0, 45],
  },
];

export const INITIAL_STEMS: CollectableStem[] = [
  {
    id: 'stem_drum_break',
    type: 'drums',
    title: 'The "Apache" Breakbeat Stem',
    era: '1973',
    attributeTag: 'unquantized funk swing break',
    position3D: [-28, 1.2, -28],
    landmarkId: 'bronx_1520_sedgwick',
  },
  {
    id: 'stem_vinyl_sp1200',
    type: 'sample',
    title: '12-Bit Blue Note Vinyl Sample',
    era: '1994',
    attributeTag: 'dusty jazz Rhodes loop',
    position3D: [26, 1.2, -26],
    landmarkId: 'queensbridge_houses',
  },
  {
    id: 'stem_moog_whistle',
    type: 'bass',
    title: 'Moog Portamento Sine Bass',
    era: '1992',
    attributeTag: 'rubbery Moog funk bassline',
    position3D: [-26, 1.2, 26],
    landmarkId: 'compton_central_ave',
  },
  {
    id: 'stem_tr808_sub',
    type: 'bass',
    title: 'Tuned 808 Sub Bass Drop',
    era: '2003',
    attributeTag: 'booming 808 sub bass',
    position3D: [26, 1.2, 26],
    landmarkId: 'atlanta_dungeon_family',
  },
  {
    id: 'stem_phonk_cowbell',
    type: 'sample',
    title: 'Memphis 808 Cowbell Melody',
    era: '1995',
    attributeTag: '808 cowbell melody',
    position3D: [-3, 1.2, -35],
    landmarkId: 'memphis_club_no_name',
  },
  {
    id: 'stem_sliding_808',
    type: 'bass',
    title: 'Drill Octave Sliding 808',
    era: '2018',
    attributeTag: 'sliding 808 glides',
    position3D: [3, 1.2, 35],
    landmarkId: 'london_drill_estates',
  },
  {
    id: 'stem_triplet_hats',
    type: 'drums',
    title: 'Supersonic Triplet Hi-Hats',
    era: 'Modern',
    attributeTag: 'crisp rolling triplet hi-hats',
    position3D: [12, 1.2, 10],
    landmarkId: 'atlanta_dungeon_family',
  },
  {
    id: 'stem_story_vocal',
    type: 'vocal',
    title: 'Narrative Storytelling Cadence',
    era: '1994',
    attributeTag: 'gritty male storytelling rap',
    position3D: [12, 1.2, -18],
    landmarkId: 'queensbridge_houses',
  },
];

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'chap_1',
    chapterNumber: 1,
    title: 'The Spark: The Rec Room at 1520 Sedgwick',
    subtitle: 'How DJ Kool Herc isolated the percussion break to invent hip-hop',
    narrativeText:
      'In August 1973 in the South Bronx, music was dominated by long funk and disco tracks. But DJ Kool Herc noticed something profound about the dancers: when the instruments dropped out and only the drum solo played — "The Break" — the energy in the room surged. By cueing up two turntables with two identical copies of the same record, Herc prolonged the drum break indefinitely. This single Music Information Retrieval (MIR) innovation gave birth to breakdancing, rapping (MCing), and the rhythm of hip-hop.',
    historicalQuote:
      '"I was trying something that had never been done. When I got to the break part, I switched it over. The crowd went crazy."',
    speaker: 'DJ Kool Herc',
    requiredLandmarkId: 'bronx_1520_sedgwick',
    unlockedPromptPreset: 'cold_case',
  },
  {
    id: 'chap_2',
    chapterNumber: 2,
    title: 'The Concrete Noir: Queensbridge & The MPC',
    subtitle: 'From live turntable loops to 12-bit digital sampler poetry',
    narrativeText:
      'By the early 1990s, the hip-hop laboratory moved from neighborhood park sound systems into bedroom studio apartments. Roger Linn and Akai invented the MPC-60, while E-mu created the SP-1200. Producers could only sample 2.5 to 10 seconds of audio. To fit entire song ideas into tiny memory, producers spun 33 RPM jazz vinyl records at 45 RPM to capture high frequencies, then digitally tuned them back down on the pads. This created the iconic crunchy, warm 12-bit punch that defined the Boom Bap era.',
    historicalQuote:
      '"We didn\'t have million-dollar studios. We had dusty vinyl crates, an SP-1200, and a window overlooking Vernon Boulevard."',
    speaker: 'Havoc (Mobb Deep)',
    requiredLandmarkId: 'queensbridge_houses',
    unlockedPromptPreset: 'cold_case',
  },
  {
    id: 'chap_3',
    chapterNumber: 3,
    title: 'Lowrider Hydraulics: The West Coast G-Funk Wave',
    subtitle: 'Cruising the boulevards with Moog synthesis and P-Funk groove',
    narrativeText:
      'While New York embraced winter grit and rapid-fire multisyllabic rhyme schemes, Compton and Long Beach designed hip-hop for convertible car stereos under the California sun. Dr. Dre and Snoop Dogg combined slowed-down parliament funk grooves with piercing high-whistle synthesizer leads that cut through roaring V8 engines. The bass was no longer merely a sampled acoustic upright — it was a thick, synthesized analog foundation.',
    historicalQuote:
      '"It\'s got to sound fat in the whip. If the 808 doesn\'t vibrate the rearview mirror, take it back to the mixing board."',
    speaker: 'Dr. Dre',
    requiredLandmarkId: 'compton_central_ave',
    unlockedPromptPreset: 'gas_fee',
  },
  {
    id: 'chap_4',
    chapterNumber: 4,
    title: 'The 808 Trap Monolith: Atlanta\'s Subterranean Revolution',
    subtitle: 'How a discontinued 1980 drum machine became the world\'s biggest bass',
    narrativeText:
      'In the mid-2000s, producers working in Atlanta transformed the Roland TR-808 kick into a melodic instrument. By pitching the decay of the kick drum across MIDI keyboards, producers created basslines that rattled structural concrete. Coupled with rapid-fire 32nd-note triplet hi-hat rolls that mirrored the frantic pace of the digital age, Trap became the dominant global sound format across hip-hop, pop, and electronic music.',
    historicalQuote:
      '"The 808 isn\'t just a drum anymore. It\'s the melody, the earthquake, and the heartbeat of the track."',
    speaker: 'Lex Luger',
    requiredLandmarkId: 'atlanta_dungeon_family',
    unlockedPromptPreset: 'blue_king',
  },
  {
    id: 'chap_5',
    chapterNumber: 5,
    title: 'The Underground Drift: Memphis Phonk & London Drill',
    subtitle: 'Cassette tape distortion meets high-speed sliding basslines',
    narrativeText:
      'In the late 2010s and 2020s, hip-hop fractured into dark, atmospheric subgenres. In Memphis, DIY cassette tape recordings from 1995 featuring cowbell melodies and sinister minor chords were resurrected by Internet producers into Phonk. Meanwhile in the United Kingdom, producers combined drill tempos with dramatic pitch glides on 808s that slide across two octaves in milliseconds. Rap beat creation became a truly decentralized, global sonic science.',
    historicalQuote:
      '"We made beats on tape decks in Memphis with no budget. Twenty years later, kids in Tokyo and London are studying that tape hiss."',
    speaker: 'DJ Paul (Three 6 Mafia)',
    requiredLandmarkId: 'memphis_club_no_name',
    unlockedPromptPreset: 'rabbit_skin',
  },
];
