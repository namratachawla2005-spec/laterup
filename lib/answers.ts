// Talk answers: the shape every answer has, the 15 pre-written answers,
// the gentle fallback, and the safety check that every answer must pass.
//
// PRE-WRITTEN ANSWERS: one for each suggested question (lib/questions.ts).
// They show if the AI is slow or fails, so the hero page always works.
// Writing rules (CLAUDE.md): never diagnose, never name a medicine or dose,
// "may be linked" / "can play a part", never promise outcomes, Indian foods
// and routines, specific "Talk to a doctor if" signs.
//
// "{, name}" is replaced with ", Meena" (or removed if she gave no name).
// Food ideas carry `notFor` so a Jain, vegan or vegetarian woman never sees
// something she doesn't eat. The main idea is always safe for every diet.

export type Answer = {
  hearYou: string;
  whatsHappening: string;
  tryThis: { main: string; more: string[] };
  seeDoctorIf: string[];
  closingLine: string;
  followUps: string[];
  symptomTags: string[];
};

type Idea = { text: string; notFor?: string[] };
type Prewritten = Omit<Answer, "tryThis" | "closingLine"> & { tryThis: { main: string; more: Idea[] } };

export const DEFAULT_DOCTOR_LIST = [
  "It's severe or getting worse",
  "It's lasted more than a few weeks",
  "It's affecting your daily life",
];

export const FALLBACK_INTRO =
  "I'm having trouble answering right now, and I don't want to give you a rushed answer.";
export const FALLBACK_DOCTOR_LIST = [
  "What you're feeling is severe, or getting worse",
  "It's affecting your sleep, work or relationships for more than a few weeks",
  "Anything feels very different from your usual",
];

const PREWRITTEN: Record<string, Prewritten> = {
  "Why do I suddenly feel so hot?": {
    symptomTags: ["hot_flashes"],
    hearYou: "Those sudden waves of heat can be startling and uncomfortable{, name}, and you're far from the only one feeling them.",
    whatsHappening:
      "Hot flashes are one of the most common changes in midlife. As oestrogen levels shift, the part of the brain that manages body temperature can become more sensitive, so it may suddenly try to cool you down with heat, flushing and sweat. They usually pass in a few minutes, and for many women they ease with time.",
    tryThis: {
      main: "When you feel one starting, pause and breathe slowly: in for 4 counts, out for 6. Keep a small hand fan or a glass of cool water nearby, and notice how you feel.",
      more: [
        { text: "Wear light cotton layers that you can take off easily, especially at night." },
        { text: "Notice whether spicy food, very hot tea or a warm room seem to bring them on, and keep a little note." },
      ],
    },
    seeDoctorIf: [
      "They disturb your sleep or work most days",
      "They come with a racing heart, weight loss or feeling unwell",
      "They're making daily life hard and you'd like to know your options",
    ],
    followUps: ["Why can't I sleep through the night anymore?", "When should I see a doctor?", "How do I talk to my family about this?"],
  },

  "Why can't I sleep through the night anymore?": {
    symptomTags: ["poor_sleep"],
    hearYou: "Waking up again and again, night after night, is truly tiring{, name}, and it makes sense that you want answers.",
    whatsHappening:
      "Sleep often changes in midlife. Shifting levels of hormones like oestrogen and progesterone can play a part in lighter sleep, night sweats and waking early. A busy mind at bedtime and caring for others can add to it. It's very common, and many women find small changes to the evening help.",
    tryThis: {
      main: "Keep your last cup of chai before 4 pm, and spend the last 10 minutes before bed away from your phone and the TV, breathing slowly (in for 4 counts, out for 6). Try it for a week and notice how you sleep.",
      more: [
        { text: "Keep the bedroom cool and wear light cotton at night." },
        { text: "Take a short walk after dinner, even 10 minutes on the terrace or around the building." },
      ],
    },
    seeDoctorIf: [
      "Poor sleep continues most nights for more than 3 to 4 weeks",
      "You feel low, hopeless or teary most days for 2 weeks or more",
      "Someone notices you snoring loudly or stopping breathing in your sleep",
    ],
    followUps: ["Why do I get angry so easily these days?", "Why am I tired all the time?", "How do I talk to my family about this?"],
  },

  "Why do I get angry so easily these days?": {
    symptomTags: ["mood_swings"],
    hearYou: "Snapping when you don't want to can leave you feeling guilty and drained{, name}. Nothing is wrong with you as a person.",
    whatsHappening:
      "Many women notice more irritability in midlife. Hormones like oestrogen help keep mood steady, so when they go up and down, feelings can swing faster. Poor sleep, tiredness and carrying a lot at home and work can make it stronger. It's common, and it often helps just to know why.",
    tryThis: {
      main: "When you feel the anger rising, give yourself a 2-minute pause: step into another room or onto the balcony and take 5 slow breaths before you reply. Notice whether it changes how the moment goes.",
      more: [
        { text: "For one week, jot down when it happens, for example after a bad night or late in the day. Patterns often show up." },
        { text: "In a calm moment, tell one person at home that you're going through some changes and may need a little space sometimes." },
      ],
    },
    seeDoctorIf: [
      "Your mood swings feel out of control or are hurting your relationships",
      "You feel low, hopeless or anxious most days for 2 weeks or more",
      "You ever have thoughts of harming yourself (please get help right away)",
    ],
    followUps: ["How do I talk to my family about this?", "Is it normal to feel anxious for no reason?", "Why can't I sleep through the night anymore?"],
  },

  "Is it normal to feel anxious for no reason?": {
    symptomTags: ["anxiety_low"],
    hearYou: "Feeling anxious without a clear reason can be unsettling{, name}, and it's brave of you to ask about it.",
    whatsHappening:
      "Yes, many women notice new or stronger anxiety in midlife, even when nothing specific is wrong. Changing hormone levels may affect the brain chemicals that help us feel calm. Poor sleep and a full plate of responsibilities can add to it. It's common, and support can really help.",
    tryThis: {
      main: "When the anxious feeling comes, try slow breathing for 2 minutes: in through your nose for 4 counts, out through your mouth for 6. Rest a hand on your chest and notice your breath slowing.",
      more: [
        { text: "Step outside for 10 minutes of morning daylight, even on the balcony or terrace." },
        { text: "Share how you feel with one person you trust, like a sister or a close friend." },
      ],
    },
    seeDoctorIf: [
      "The anxiety is there most days for 2 weeks or more",
      "You have sudden panic attacks or a racing heart",
      "It's stopping you from doing everyday things",
    ],
    followUps: ["Why can't I sleep through the night anymore?", "How do I talk to my family about this?", "When should I see a doctor?"],
  },

  "Why am I forgetting small things?": {
    symptomTags: ["brain_fog"],
    hearYou: "Walking into a room and forgetting why can be frustrating, and even a little worrying{, name}.",
    whatsHappening:
      "Many women notice forgetfulness or \"brain fog\" in midlife. Shifting oestrogen levels can affect memory and focus for a while, and poor sleep and stress often make it worse. For most women, this kind of forgetfulness is common and not a sign of something serious.",
    tryThis: {
      main: "Keep one small notebook or a note on your phone for the day's to-dos, and put your keys and glasses in the same spot every time. Notice whether your days feel a little lighter.",
      more: [
        { text: "Do one thing at a time where you can, especially when you're tired." },
        { text: "Take a 10-minute walk after lunch or dinner, and notice whether you feel more alert." },
      ],
    },
    seeDoctorIf: [
      "Forgetfulness is getting worse quickly, or people close to you are worried",
      "You get lost in familiar places or struggle with everyday tasks",
      "It comes with low mood, tiredness or other changes that worry you",
    ],
    followUps: ["Why can't I sleep through the night anymore?", "Why am I tired all the time?", "When should I see a doctor?"],
  },

  "Why am I tired all the time?": {
    symptomTags: ["tiredness"],
    hearYou: "Feeling tired no matter how much you rest is draining{, name}, especially when so many people depend on you.",
    whatsHappening:
      "Tiredness is very common in midlife. Hormonal changes can play a part, and so can poor sleep, stress and very full days. Low iron and thyroid changes are also common in Indian women and can leave you feeling worn out, so a simple blood test is worth it if the tiredness doesn't ease.",
    tryThis: {
      main: "Add one iron-rich food to your day, like a handful of roasted chana, a bowl of dal with a squeeze of lemon, or ragi. Try it for 2 weeks and notice your energy.",
      more: [
        { text: "Take a short walk in the morning light, even 10 minutes." },
        { text: "Have your tea or coffee a little away from meals, since it may make it harder for the body to take in iron." },
      ],
    },
    seeDoctorIf: [
      "You feel tired most days for more than 2 to 3 weeks",
      "You feel breathless, dizzy or look very pale",
      "Your periods are very heavy",
    ],
    followUps: ["Is it normal for my periods to change like this?", "Why can't I sleep through the night anymore?", "When should I see a doctor?"],
  },

  "Can menopause cause body pain?": {
    symptomTags: ["body_aches"],
    hearYou: "Aches in your joints and body can make every day feel harder{, name}, and you're right to ask.",
    whatsHappening:
      "Many women notice more aches and stiffness in midlife. Oestrogen helps keep joints and muscles comfortable, so lower levels may be linked to aches, especially in the mornings. Bone strength also changes at this stage, which is why staying active and eating calcium-rich foods matters.",
    tryThis: {
      main: "Start the day with 5 minutes of gentle stretching, like slow neck rolls, shoulder circles and ankle turns, before you get busy. Notice how your body feels after a week.",
      more: [
        { text: "Add a calcium-rich food each day, like ragi, til (sesame) or a bowl of curd.", notFor: ["vegan"] },
        { text: "Add a calcium-rich food each day, like ragi, til (sesame) or rajma.", notFor: ["vegetarian", "eggetarian", "non_vegetarian", "jain", "prefer_not_to_say", ""] },
        { text: "Take a 15-minute walk most days, at a pace where you can still talk." },
      ],
    },
    seeDoctorIf: [
      "A joint is swollen, red or hot",
      "The pain is severe, getting worse, or wakes you at night",
      "You break a bone from a small fall or bump",
    ],
    followUps: ["Why am I tired all the time?", "When should I see a doctor?", "What is perimenopause, in simple words?"],
  },

  "Why am I gaining weight around my stomach?": {
    symptomTags: ["weight_changes"],
    hearYou: "It can be confusing when your body changes even though you haven't changed much{, name}.",
    whatsHappening:
      "Many women notice weight settling around the tummy in midlife. Lower oestrogen may change where the body stores fat, and the body also tends to lose a little muscle with age. Poor sleep and stress can add to it. It's common, and small steady habits tend to help more than strict diets.",
    tryThis: {
      main: "Add a 15-minute walk after dinner on most days of the week; it can fit into family time too. Notice how you feel after 2 weeks.",
      more: [
        { text: "Fill half your plate with vegetables or salad, and add a protein like dal, chana or paneer.", notFor: ["vegan"] },
        { text: "Fill half your plate with vegetables or salad, and add a protein like dal, chana or tofu.", notFor: ["vegetarian", "eggetarian", "non_vegetarian", "jain", "prefer_not_to_say", ""] },
        { text: "Keep sweets and fried snacks for special days rather than every day." },
      ],
    },
    seeDoctorIf: [
      "You're gaining weight quickly without knowing why",
      "It comes with tiredness, feeling cold or swelling",
      "You'd like to check your blood sugar, thyroid or blood pressure",
    ],
    followUps: ["Why am I tired all the time?", "Why can't I sleep through the night anymore?", "When should I see a doctor?"],
  },

  "Is it normal for my periods to change like this?": {
    symptomTags: ["periods"],
    hearYou: "Changes in your periods can feel worrying when you don't know what's normal{, name}.",
    whatsHappening:
      "In the years before periods stop, it's very common for them to become irregular. They may come closer together or further apart, be lighter or heavier, or skip months, because hormone levels go up and down unevenly. Most of these changes are common, but some are worth checking.",
    tryThis: {
      main: "Keep a simple note of each period: the start date, how many days it lasted, and how heavy it felt. It takes a minute and makes a doctor visit much easier.",
      more: [
        { text: "If your periods are heavy, add iron-rich foods like dal, chana, ragi or green leafy vegetables." },
        { text: "Keep a spare pad and a change of clothes in your bag, so a surprise period feels less stressful." },
      ],
    },
    seeDoctorIf: [
      "You soak through a pad every 1 to 2 hours, or pass large clots",
      "Bleeding lasts more than 7 days, or comes between periods or after intimacy",
      "You have any bleeding after your periods have stopped for a year",
    ],
    followUps: ["Why am I tired all the time?", "When should I see a doctor?", "What is perimenopause, in simple words?"],
  },

  "Why am I getting more headaches?": {
    symptomTags: ["headaches"],
    hearYou: "Headaches that keep coming back can really wear you down{, name}.",
    whatsHappening:
      "Some women notice more headaches in midlife, especially around periods or when periods become irregular. Changing hormone levels may play a part, along with poor sleep, skipped meals, not drinking enough water and stress.",
    tryThis: {
      main: "Keep a glass of water near you and finish it every couple of hours, and try not to skip meals on busy days. Notice whether the headaches come less often.",
      more: [
        { text: "For 2 weeks, note the days you get a headache and what was happening, like a bad night, a skipped meal or your period." },
        { text: "When one starts, rest in a dark, quiet room for 15 minutes if you can." },
      ],
    },
    seeDoctorIf: [
      "A headache is sudden and severe, or the worst you've ever had (get help right away)",
      "It comes with blurred vision, weakness or trouble speaking (get help right away)",
      "Headaches are happening more often than before",
    ],
    followUps: ["Why can't I sleep through the night anymore?", "Is it normal for my periods to change like this?", "When should I see a doctor?"],
  },

  "Why is my hair thinning?": {
    symptomTags: ["hair_skin"],
    hearYou: "Noticing more hair on your comb or pillow can really affect how you feel about yourself{, name}.",
    whatsHappening:
      "Many women notice thinner hair or drier skin in midlife. Oestrogen helps hair stay in its growing phase, so as levels change, hair may shed more or grow finer. Stress, low iron and thyroid changes can also play a part, so it's worth checking if the change is sudden.",
    tryThis: {
      main: "Be gentle with your hair: massage your scalp lightly once a week, avoid tight buns or plaits, and use a wide-toothed comb. Notice how your hair feels over a month.",
      more: [
        { text: "Include protein at each meal, like dal, chana, sprouts or curd.", notFor: ["vegan"] },
        { text: "Include protein at each meal, like dal, chana, sprouts or peanuts.", notFor: ["vegetarian", "eggetarian", "non_vegetarian", "jain", "prefer_not_to_say", ""] },
        { text: "Drink enough water, and use a gentle moisturiser if your skin feels dry." },
      ],
    },
    seeDoctorIf: [
      "Hair is falling out in patches or very suddenly",
      "It comes with tiredness, weight changes or feeling cold",
      "You'd like to check your iron and thyroid",
    ],
    followUps: ["Why am I tired all the time?", "When should I see a doctor?", "What is perimenopause, in simple words?"],
  },

  "Is discomfort during intimacy common at this age?": {
    symptomTags: ["intimacy"],
    hearYou: "Thank you for asking about something that can feel hard to talk about{, name}. You're not alone in this.",
    whatsHappening:
      "Yes, it's common. As oestrogen levels go down, the tissues of the vagina can become thinner and drier, which may make intimacy uncomfortable. Many women feel shy about raising it, but doctors hear about it often, and there are gentle options worth discussing.",
    tryThis: {
      main: "Take things slowly and give yourself more time to feel ready. If it feels right, tell your partner in a calm moment that your body is changing and you'd like to go gently.",
      more: [
        { text: "Wear breathable cotton underwear, and avoid scented soaps or washes in that area." },
        { text: "Write down your questions for a doctor so it's easier to bring up. You can add this to your doctor notes." },
      ],
    },
    seeDoctorIf: [
      "The discomfort continues or is getting worse",
      "You have any bleeding after intimacy",
      "You have burning, itching, unusual discharge or pain when passing urine",
    ],
    followUps: ["How do I talk to my family about this?", "When should I see a doctor?", "What is perimenopause, in simple words?"],
  },

  "What is perimenopause, in simple words?": {
    symptomTags: [],
    hearYou: "It helps so much to understand the words{, name}, so here it is simply.",
    whatsHappening:
      "Perimenopause is the time before periods stop completely, when hormone levels start to go up and down. It often begins in the 40s and can last a few years. Periods may become irregular, and some women notice changes in sleep, mood, heat or energy. Menopause is the point when periods have stopped for a full year.",
    tryThis: {
      main: "Start noticing your own body: tap the quick check-in on Home each day, so you can see your patterns over a few weeks.",
      more: [
        { text: "Talk to a woman you trust, like an older sister or friend, about what she went through." },
        { text: "Write down questions as they come, so you have them ready for a doctor." },
      ],
    },
    seeDoctorIf: [
      "Your periods change a lot, or bleeding is very heavy",
      "You're under 40 and your periods have stopped or become irregular",
      "Any change is affecting your daily life",
    ],
    followUps: ["When should I see a doctor?", "Why can't I sleep through the night anymore?", "How do I talk to my family about this?"],
  },

  "When should I see a doctor?": {
    symptomTags: [],
    hearYou: "That's a wise thing to ask{, name}. Knowing when to go makes it easier to look after yourself.",
    whatsHappening:
      "You don't need to wait for something serious. A visit is worth it whenever changes are affecting your sleep, mood, work or relationships, or if you simply want to understand your options. A gynaecologist is usually the best person, and a general physician or family doctor is a good place to start too.",
    tryThis: {
      main: "Open the Doctor tab and look at the summary LaterUp prepares for you. It can help you say what you need, even if it feels awkward.",
      more: [
        { text: "Write down your 3 biggest worries before the visit, so you don't forget them." },
        { text: "Take someone you trust with you, if that would make it easier." },
      ],
    },
    seeDoctorIf: [
      "You have any bleeding after your periods have stopped for a year, or find a lump in your breast",
      "Your periods are very heavy, or you bleed between periods",
      "You feel low, hopeless or anxious most days for 2 weeks or more",
    ],
    followUps: ["How do I talk to my family about this?", "What is perimenopause, in simple words?", "Is it normal for my periods to change like this?"],
  },

  "How do I talk to my family about this?": {
    symptomTags: [],
    hearYou: "It can feel hard to explain what you're going through{, name}, especially when everyone is used to you looking after them.",
    whatsHappening:
      "Many women find it difficult to talk about midlife changes at home, especially in a joint family. But family members often want to help; they just don't know what's happening. A short, simple explanation can make a big difference to how supported you feel.",
    tryThis: {
      main: "Pick one person to start with, at a calm moment, and try a simple sentence like: \"My body is going through some changes at this age. Some days I may be more tired or irritable, and a little help would mean a lot.\"",
      more: [
        { text: "Ask for one specific thing, like help with dinner twice a week, rather than general help." },
        { text: "If talking feels hard, show them what you've read here about midlife changes." },
      ],
    },
    seeDoctorIf: [
      "Your mood or tiredness is affecting your relationships at home",
      "You feel low, hopeless or alone most days for 2 weeks or more",
      "You'd like a doctor's help in explaining things to your family",
    ],
    followUps: ["Why do I get angry so easily these days?", "When should I see a doctor?", "What is perimenopause, in simple words?"],
  },
};

export const PREWRITTEN_QUESTIONS = Object.keys(PREWRITTEN);

// Profile fields used to personalise. Her name stays on the device.
export type TalkProfile = {
  name: string | null;
  diet: string | null;
  doctor_status: string | null;
};

const SOON_LINE = "Please book a visit with a doctor soon, so this can be checked.";

function closingFor(doctorStatus: string | null): string {
  if (doctorStatus === "not_comfortable") return "When you're ready, LaterUp can help you prepare what to say to your doctor.";
  if (doctorStatus === "mentioned_no_help") return "You deserve to be heard. LaterUp can help you explain clearly what you're going through.";
  return "";
}

export function addName(text: string, name: string | null): string {
  return text.replace("{, name}", name ? `, ${name}` : "");
}

// Exact match on one of the 15 questions (ignores case, spaces, final "?")
export function findPrewritten(message: string): Prewritten | null {
  const key = (s: string) => s.toLowerCase().replace(/[?.!\s]+$/g, "").replace(/\s+/g, " ").trim();
  const match = PREWRITTEN_QUESTIONS.find((q) => key(q) === key(message));
  return match ? PREWRITTEN[match] : null;
}

export function personalisePrewritten(p: Prewritten, profile: TalkProfile, seeDoctorSoon: boolean): Answer {
  const diet = profile.diet ?? "";
  return {
    ...p,
    hearYou: addName(p.hearYou, profile.name),
    tryThis: {
      main: p.tryThis.main,
      more: p.tryThis.more.filter((i) => !i.notFor?.includes(diet)).map((i) => i.text).slice(0, 2),
    },
    seeDoctorIf: seeDoctorSoon ? [SOON_LINE, ...p.seeDoctorIf] : p.seeDoctorIf,
    closingLine: closingFor(profile.doctor_status),
  };
}

// ---------------- Safety check on every answer before it shows ----------------
const MEDICINES = [
  "paracetamol", "crocin", "dolo", "ibuprofen", "combiflam", "brufen", "aspirin", "disprin", "diclofenac",
  "metformin", "thyroxine", "levothyroxine", "thyronorm", "eltroxin", "estradiol", "oestradiol", "premarin",
  "tibolone", "gabapentin", "clonidine", "fluoxetine", "sertraline", "escitalopram", "paroxetine", "venlafaxine",
  "melatonin", "zolpidem", "alprazolam", "clonazepam", "diazepam", "ashwagandha", "shatavari", "black cohosh",
  "evening primrose", "isoflavone", "biotin", "folic acid", "antidepressant", "sleeping pill", "painkiller",
];
const DOSE = /\b\d+(\.\d+)?\s?(mg|mcg|µg|iu|ml|g)\b|\b(tablets?|capsules?|dose|dosage|pills?|supplements?)\b/i;
const DIAGNOSIS =
  /\byou (have|are suffering from|are in|have got) (peri ?menopause|menopause|post ?menopause|depression|anaemia|anemia|pcos|thyroid|cancer|a disorder|a disease)\b|\byou(?:'re| are) (peri ?menopausal|menopausal|post ?menopausal|depressed|anaemic)\b|\b(caused by|because of) (the )?menopause\b|\bmenopause (is causing|causes)\b|\b(this|it) will (cure|fix|treat|improve|stop)\b|\bcures?\b/i;

export function answerProblems(a: Answer): string[] {
  const text = [a.hearYou, a.whatsHappening, a.tryThis.main, ...a.tryThis.more, ...a.seeDoctorIf, a.closingLine].join(" ");
  const lower = text.toLowerCase();
  const problems: string[] = [];
  const med = MEDICINES.find((m) => lower.includes(m));
  if (med) problems.push(`medicine: ${med}`);
  const dose = text.match(DOSE);
  if (dose) problems.push(`dose word: ${dose[0]}`);
  const diag = text.match(DIAGNOSIS);
  if (diag) problems.push(`diagnosis or promise: ${diag[0]}`);
  return problems;
}

// Fill gaps safely (e.g. empty doctor list)
export function withDefaults(a: Answer): Answer {
  return { ...a, seeDoctorIf: a.seeDoctorIf.length ? a.seeDoctorIf : DEFAULT_DOCTOR_LIST };
}
