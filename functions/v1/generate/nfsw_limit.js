/**
 * NSFW Content Filter
 * Provides sensitive content detection for image generation prompts
 */

// English body parts
const BODY_PARTS = [
  'penis', 'vagina', 'cock', 'dick', 'pussy', 'cunt', 'boobs', 'tits', 
  'nipples', 'breast', 'ass', 'butt', 'anus', 'genitals', 'crotch',
  'clitoris', 'labia', 'scrotum', 'testicles', 'balls',
  
  'p3nis', 'v4gina', 'c0ck', 'd1ck', 'b00bs', 't1ts', 'n1pples',
  'br3ast', '4ss', 'gen1tals', 'cr0tch',
  
  'boobies', 'titties', 'knockers', 'jugs', 'melons', 'hooters',
  'shaft', 'rod', 'member', 'manhood', 'package', 'junk',
  'rear', 'behind', 'bottom', 'backside', 'rump', 'bum'
];

// English sexual acts
const SEXUAL_ACTS = [
  'sex', 'fuck', 'fucking', 'intercourse', 'oral', 'anal', 'masturbate',
  'orgasm', 'climax', 'cum', 'cumming', 'ejaculate', 'penetration',
  'foreplay', 'handjob', 'blowjob', 'cunnilingus', 'fellatio',
  
  'f*ck', 'f**k', 'fck', 'fuk', 'phuck', 's3x', 'm4sturbate',
  'org4sm', 'cl1max', 'ej4culate', 'penetr4tion',
  
  'hook up', 'make love', 'get it on', 'do it', 'bang', 'screw',
  'shag', 'hump', 'bone', 'nail', 'pound', 'smash', 'tap',
  'ride', 'mount', 'thrust', 'stroke', 'rub', 'touch',
  
  'bdsm', 'bondage', 'domination', 'submission', 'sadism', 'masochism',
  'whip', 'spank', 'tie up', 'bound', 'slave', 'master', 'mistress'
];

// English adult content
const ADULT_CONTENT = [
  'porn', 'porno', 'pornography', 'xxx', 'adult', 'erotic', 'erotica',
  'nsfw', 'nude', 'naked', 'nudity', 'strip', 'stripper', 'escort',
  'prostitute', 'hooker', 'whore', 'slut', 'bitch',
  
  'p0rn', 'p*rn', 'pr0n', 'nud3', 'n4ked', 'n5fw', 'str1p',
  'escort', 'pr0stitute', 'h00ker', 'wh0re', 'sl*t', 'b*tch',
  
  'camgirl', 'webcam', 'onlyfans', 'chaturbate', 'pornhub',
  'milf', 'gilf', 'teen', 'barely legal', 'jailbait',
  
  'lesbian', 'gay', 'bisexual', 'threesome', 'orgy', 'gangbang',
  'bukkake', 'creampie', 'facial', 'dp', 'mmf', 'ffm'
];

// English clothing state
const CLOTHING_STATE = [
  'topless', 'bottomless', 'braless', 'pantyless', 'commando',
  'undressed', 'unclothed', 'disrobed', 'exposed', 'revealing',
  'skimpy', 'scanty', 'provocative', 'seductive', 'sultry',
  'lingerie', 'underwear', 'panties', 'bra', 'thong', 'g-string',
  'bikini', 'swimsuit', 'bathing suit', 'negligee', 'teddy'
];

// Chinese body parts
const CHINESE_BODY = [
  '阴茎', '阴道', '乳房', '胸部', '臀部', '屁股', '生殖器', '下体',
  '乳头', '阴唇', '阴蒂', '睾丸', '龟头', '包皮', '肛门',
  
  '鸡鸡', '小弟弟', '老二', '命根子', '鸟', '屌', '奶子', '咪咪',
  '波霸', '巨乳', '美乳', '翘臀', '肥臀', '蜜桃臀', '美臀',
  
  'jj', 'dd', 'nz', 'pp', '那里', '那个地方', '私处'
];

// Chinese sexual acts
const CHINESE_SEXUAL = [
  '性交', '做爱', '性爱', '交配', '性行为', '房事', '云雨', '床笫',
  '手淫', '自慰', '撸管', '打飞机', '高潮', '射精', '性高潮',
  '口交', '肛交', '69', '后入', '传教士', '骑乘', '侧位',
  
  '啪啪啪', '嘿咻', '羞羞', '不可描述', '开车', '老司机',
  'xxoo', 'ml', 'ppp', '车震', '野战', '一夜情', '约炮',
  
  '鱼水之欢', '巫山云雨', '共赴云雨', '春宵一刻', '颠鸾倒凤'
];

// Chinese adult content
const CHINESE_ADULT = [
  '色情', '黄片', '毛片', 'AV', '成人片', '三级片', '情色', '艳情',
  '裸体', '全裸', '半裸', '果体', '天体', '裸照', '艳照', '裸',
  '脱衣', '脱光', '一丝不挂', '赤身裸体', '光着身子',
  
  '妓女', '鸡', '小姐', '失足妇女', '援交', '包养', '二奶',
  '鸭子', '牛郎', '陪酒女', '红灯区', '风月场所',
  
  '老湿', '湿了', '硬了', '撸', '鲁', '屌丝', '骚', '浪', '荡'
];

/**
 * Check if text contains sensitive content
 * @param {string} text - Text to check
 * @returns {Object} Result object with hasSensitive and matchedWords
 */
function checkSensitiveContent(text) {
  if (!text || typeof text !== 'string') {
    return { hasSensitive: false, matchedWords: [] };
  }

  // Combine all sensitive words into one array
  const SENSITIVE_WORDS = [
    ...BODY_PARTS,
    ...SEXUAL_ACTS,
    ...ADULT_CONTENT,
    ...CLOTHING_STATE,
    ...CHINESE_BODY,
    ...CHINESE_SEXUAL,
    ...CHINESE_ADULT,
  ];

  const lowerText = text.toLowerCase();
  const matchedWords = [];

  // Check if text contains any sensitive word (case-insensitive)
  for (const word of SENSITIVE_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      matchedWords.push(word);
    }
  }

  return {
    hasSensitive: matchedWords.length > 0,
    matchedWords: matchedWords
  };
}

/**
 * Get all sensitive words for reference
 * @returns {Object} Object containing all sensitive word categories
 */
function getAllSensitiveWords() {
  return {
    BODY_PARTS,
    SEXUAL_ACTS,
    ADULT_CONTENT,
    CLOTHING_STATE,
    CHINESE_BODY,
    CHINESE_SEXUAL,
    CHINESE_ADULT
  };
}

// Export functions
export {
  checkSensitiveContent,
  getAllSensitiveWords,
  BODY_PARTS,
  SEXUAL_ACTS,
  ADULT_CONTENT,
  CLOTHING_STATE,
  CHINESE_BODY,
  CHINESE_SEXUAL,
  CHINESE_ADULT
}; 