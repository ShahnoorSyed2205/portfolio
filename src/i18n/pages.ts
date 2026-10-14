import type { Locale } from "./config";

export const SLUGS = ["usdt-desk", "property-payments", "crypto-click-payments", "about"] as const;
export type Slug = (typeof SLUGS)[number];

export type PageCopy = {
  navLabel: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: { h: string; p: string[] }[];
  faq: { q: string; a: string }[];
  cta: string;
  topic: string;
  more: string;
};

const en: Record<Slug, PageCopy> = {
  "usdt-desk": {
    navLabel: "USDT desk",
    title: "Buy and Sell USDT in Dubai | 369 LTD",
    description:
      "Buy and sell USDT with a Dubai desk on Sheikh Zayed Road. Rate, amount and settlement route confirmed up front. Online or in person with 369 LTD.",
    h1: "Buy and sell USDT in Dubai",
    intro:
      "369 LTD runs a USDT desk on Sheikh Zayed Road. Trade online or in person, with the amount, rate and settlement route confirmed before anything moves.",
    sections: [
      {
        h: "How a USDT trade works",
        p: [
          "Send a request with the amount and your preferred currency (AED, USD, EUR or GBP). Our desk replies with a rate and a settlement route. Nothing moves until you confirm both.",
          "Identity and source-of-funds checks happen up front, so settlement is quick once you approve.",
        ],
      },
      {
        h: "Why trade with a desk",
        p: [
          "Settlement is direct, with no broker in the middle. You deal with the same team from quote to completion, online or at our office in API World Tower.",
          "We also trade our own assets and use AI-driven market analysis, so pricing reflects live market data and not guesswork.",
        ],
      },
      {
        h: "Who uses the desk",
        p: [
          "Individual investors and traders in the UAE, businesses that need to move value across borders, and property buyers who need USDT before a real estate payment.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I buy USDT with AED in Dubai?",
        a: "Yes. Tell us the amount and currency through the form or visit the office. We confirm the rate and the settlement route before any transfer.",
      },
      {
        q: "Can I sell USDT for AED?",
        a: "Yes. The available settlement routes depend on the amount and the checks that apply to your case. Our desk confirms them when you request a quote.",
      },
      {
        q: "Is there a minimum amount?",
        a: "Minimums depend on the route. Ask our desk when you request a quote.",
      },
      {
        q: "Is trading USDT safe?",
        a: "Digital assets are volatile and stablecoins carry their own risks. We verify identity and source of funds and confirm every term in advance. This is not investment advice.",
      },
    ],
    cta: "Request a USDT quote",
    topic: "buy-usdt",
    more: "Related services",
  },
  "property-payments": {
    navLabel: "Property payments",
    title: "Pay for Dubai Property with Crypto | 369 LTD",
    description:
      "Settle Dubai property deals in crypto. 369 LTD converts and verifies funds for buyers, agencies and developers, without waiting on banking hours.",
    h1: "Pay for Dubai property with crypto",
    intro:
      "369 LTD helps buyers, agencies and developers settle property deals in digital assets, so transfers do not wait on banking hours.",
    sections: [
      {
        h: "How it works",
        p: [
          "The buyer, seller and agency agree the price and payment terms. We confirm the route, convert and verify the funds, and settle to the agreed account.",
          "Every party receives clear records of the transaction.",
        ],
      },
      {
        h: "For international buyers",
        p: [
          "Overseas investors often lose days to transfer delays and bank cut-offs. Crypto settlement removes that wait when the process is run properly, which matters in a market where opportunities close fast.",
        ],
      },
      {
        h: "For agencies and developers",
        p: [
          "Accept crypto payments from international investors without changing your sales process. We handle conversion, verification and settlement. You keep the client relationship.",
        ],
      },
      {
        h: "Checks and compliance",
        p: [
          "Identity and source-of-funds checks run before settlement. We work within the framework of our licence from Digital Assets Oasis (Ras Al Khaimah) and applicable UAE law.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I buy property in Dubai with USDT or Bitcoin?",
        a: "Where the seller or agency agrees, yes. 369 LTD converts and verifies the funds and settles to the agreed account.",
      },
      {
        q: "Does the seller receive crypto or AED?",
        a: "That is agreed between the parties. We can settle in the currency the seller prefers, subject to checks and the route confirmed up front.",
      },
      {
        q: "How long does settlement take?",
        a: "Settlement starts as soon as checks clear and all parties confirm. Timing depends on the route, which we confirm in advance.",
      },
      {
        q: "Do agencies need to change how they sell?",
        a: "No. You keep your process and your client relationship. We handle the payment side.",
      },
    ],
    cta: "Start a property payment",
    topic: "property",
    more: "Related services",
  },
  "crypto-click-payments": {
    navLabel: "Crypto Click Payments",
    title: "Crypto Click Payments | Instant Crypto Payments",
    description:
      "Crypto Click Payments by 369 LTD: instant crypto payments for property, services and commerce in the UAE, with API access and onboarding for businesses.",
    h1: "Crypto Click Payments",
    intro:
      "Instant crypto payments for property, services and commerce. Simple for users, built for B2B partners.",
    sections: [
      {
        h: "What it is",
        p: [
          "Crypto Click Payments lets users and businesses pay and get paid in digital assets quickly, without the delays of traditional transfers.",
        ],
      },
      {
        h: "Built for businesses",
        p: [
          "SMEs, tech start-ups, digital agencies, e-commerce and service companies in Dubai and across MENA get a fast payment route, support and API access for their platforms, and simple onboarding.",
        ],
      },
      {
        h: "Where it is used",
        p: [
          "Real estate deals, professional services, online commerce and luxury retail: anywhere speed and a global payer base matter.",
        ],
      },
      {
        h: "Onboarding",
        p: [
          "We provide regulatory guidance and setup, so your team can start accepting crypto without rebuilding its payment stack.",
        ],
      },
    ],
    faq: [
      {
        q: "What is Crypto Click Payments?",
        a: "It is the instant payment solution from 369 LTD. Users and B2B partners pay and get paid in digital assets quickly, including for real estate, services and commerce.",
      },
      {
        q: "Can my business accept crypto payments in the UAE?",
        a: "Yes, with the right setup and checks. 369 LTD supports onboarding and regulatory guidance for businesses.",
      },
      {
        q: "Is there an API?",
        a: "API access and platform support are part of the offer for business partners. Contact our desk for the technical details.",
      },
      {
        q: "Can customers pay in USDT?",
        a: "USDT is our core asset. Ask our desk which other assets are supported for your use case.",
      },
    ],
    cta: "Talk to us about your firm",
    topic: "business",
    more: "Related services",
  },
  about: {
    navLabel: "About",
    title: "About 369 LTD | Licensed Fintech in Dubai",
    description:
      "369 LTD is a Dubai fintech licensed by Digital Assets Oasis. AI crypto analysis, digital asset trading and Crypto Click Payments. Where crypto meets reality.",
    h1: "About 369 LTD",
    intro:
      "369 LTD is a Dubai-based fintech that connects digital assets with real-world opportunities. Where crypto meets reality.",
    sections: [
      {
        h: "Who we are",
        p: [
          "A fintech built on AI-driven crypto analysis, the buying and selling of digital assets, and Crypto Click Payments. Licensed by Digital Assets Oasis (Ras Al Khaimah) and based on Sheikh Zayed Road, Dubai.",
        ],
      },
      {
        h: "Vision and mission",
        p: [
          "Our vision is to be the trusted hub of digital finance in the UAE and the Middle East, linking traditional markets and digital assets through smart, safe and accessible technology.",
          "Our mission is to give investors, traders and businesses one complete ecosystem: predictive market analysis, fast and secure transactions, and crypto payment solutions built for real needs.",
        ],
      },
      {
        h: "What 369 means",
        p: ["The name comes from the number sequence 369. It stands for balance, logic and manifestation."],
      },
      {
        h: "Visit us",
        p: ["Ground Floor, Office 201, API World Tower, Sheikh Zayed Road, Dubai, UAE. PO Box 414494."],
      },
    ],
    faq: [
      {
        q: "Is 369 LTD licensed?",
        a: "Yes. 369 LTD operates under a licence from Digital Assets Oasis (Ras Al Khaimah) and is based in Dubai.",
      },
      {
        q: "What does 369 mean?",
        a: "It stands for balance, logic and manifestation, the principles behind how we work.",
      },
      {
        q: "Where is 369 LTD based?",
        a: "Ground Floor, Office 201, API World Tower, Sheikh Zayed Road, Dubai, UAE.",
      },
    ],
    cta: "Speak to our desk",
    topic: "buy-usdt",
    more: "Our services",
  },
};

const ar: Record<Slug, PageCopy> = {
  "usdt-desk": {
    navLabel: "مكتب USDT",
    title: "شراء وبيع USDT في دبي | 369 ليميتد",
    description:
      "اشترِ وبِع USDT عبر مكتب في دبي على شارع الشيخ زايد. نؤكد السعر والمبلغ ومسار التسوية مسبقًا، عبر الإنترنت أو حضوريًا مع 369 ليميتد.",
    h1: "شراء وبيع USDT في دبي",
    intro:
      "تدير 369 ليميتد مكتبًا لـ USDT على شارع الشيخ زايد. تداول عبر الإنترنت أو حضوريًا، مع تأكيد المبلغ والسعر ومسار التسوية قبل تحريك أي شيء.",
    sections: [
      {
        h: "كيف تتم صفقة USDT",
        p: [
          "أرسل طلبك بالمبلغ والعملة المفضلة (درهم أو دولار أو يورو أو جنيه). يردّ مكتبنا بسعر ومسار تسوية، ولا يتحرك شيء قبل تأكيدك لهما.",
          "تتم فحوص الهوية ومصدر الأموال مسبقًا، فتكون التسوية سريعة بعد موافقتك.",
        ],
      },
      {
        h: "لماذا التداول عبر مكتب",
        p: [
          "التسوية مباشرة ودون وسيط. تتعامل مع الفريق نفسه من العرض حتى الإتمام، عبر الإنترنت أو في مكتبنا ببرج API World.",
          "نتداول أصولنا الخاصة أيضًا ونستخدم تحليل السوق بالذكاء الاصطناعي، فيعكس السعر بيانات السوق الحية لا التخمين.",
        ],
      },
      {
        h: "من يستخدم المكتب",
        p: [
          "المستثمرون والمتداولون الأفراد في الإمارات، والشركات التي تنقل القيمة عبر الحدود، ومشترو العقارات الذين يحتاجون إلى USDT قبل دفعة عقارية.",
        ],
      },
    ],
    faq: [
      {
        q: "هل يمكنني شراء USDT بالدرهم في دبي؟",
        a: "نعم. أخبرنا بالمبلغ والعملة عبر النموذج أو زُرنا في المكتب. نؤكد السعر ومسار التسوية قبل أي تحويل.",
      },
      {
        q: "هل يمكنني بيع USDT مقابل الدرهم؟",
        a: "نعم. تعتمد مسارات التسوية المتاحة على المبلغ والفحوص المطبّقة على حالتك، ويؤكدها مكتبنا عند طلب عرض السعر.",
      },
      {
        q: "هل يوجد حد أدنى للمبلغ؟",
        a: "تختلف الحدود الدنيا بحسب المسار. اسأل مكتبنا عند طلب عرض السعر.",
      },
      {
        q: "هل تداول USDT آمن؟",
        a: "الأصول الرقمية متقلبة، وللعملات المستقرة مخاطرها الخاصة. نتحقق من الهوية ومصدر الأموال ونؤكد كل الشروط مسبقًا. هذا ليس استشارة استثمارية.",
      },
    ],
    cta: "اطلب عرض سعر USDT",
    topic: "buy-usdt",
    more: "خدمات ذات صلة",
  },
  "property-payments": {
    navLabel: "المدفوعات العقارية",
    title: "دفع ثمن عقار في دبي بالعملات الرقمية | 369 ليميتد",
    description:
      "أتمّ صفقات عقارات دبي بالعملات الرقمية. تحوّل 369 ليميتد الأموال وتتحقق منها للمشترين والوكالات والمطوّرين دون انتظار ساعات عمل البنوك.",
    h1: "ادفع ثمن عقار في دبي بالعملات الرقمية",
    intro:
      "تساعد 369 ليميتد المشترين والوكالات والمطوّرين على إتمام الصفقات العقارية بالأصول الرقمية، فلا تنتظر التحويلات ساعات عمل البنوك.",
    sections: [
      {
        h: "كيف تعمل",
        p: [
          "يتفق المشتري والبائع والوكالة على السعر وشروط الدفع. نؤكد المسار، ونحوّل الأموال ونتحقق منها، ثم نسوّيها إلى الحساب المتفق عليه.",
          "يحصل كل طرف على سجلات واضحة للمعاملة.",
        ],
      },
      {
        h: "للمشترين الدوليين",
        p: [
          "يخسر المستثمرون من الخارج أيامًا بسبب تأخر التحويلات ومواعيد البنوك. التسوية بالعملات الرقمية تُنهي هذا الانتظار حين تُدار العملية بإتقان، وهذا مهم في سوق تُغلق فرصه بسرعة.",
        ],
      },
      {
        h: "للوكالات والمطوّرين",
        p: [
          "اقبل مدفوعات العملات الرقمية من المستثمرين الدوليين دون تغيير عملية البيع لديك. نتولى التحويل والتحقق والتسوية، وتحتفظ أنت بعلاقتك مع العميل.",
        ],
      },
      {
        h: "الفحوص والالتزام",
        p: [
          "تُجرى فحوص الهوية ومصدر الأموال قبل التسوية. نعمل ضمن إطار ترخيصنا من واحة الأصول الرقمية (رأس الخيمة) وأحكام القانون المعمول به في الإمارات.",
        ],
      },
    ],
    faq: [
      {
        q: "هل يمكنني شراء عقار في دبي بـ USDT أو بيتكوين؟",
        a: "نعم متى وافق البائع أو الوكالة. تحوّل 369 ليميتد الأموال وتتحقق منها وتسوّيها إلى الحساب المتفق عليه.",
      },
      {
        q: "هل يستلم البائع عملات رقمية أم دراهم؟",
        a: "يُتفق على ذلك بين الأطراف. يمكننا التسوية بالعملة التي يفضلها البائع، بحسب الفحوص والمسار المؤكَّد مسبقًا.",
      },
      {
        q: "كم تستغرق التسوية؟",
        a: "تبدأ التسوية فور اكتمال الفحوص وتأكيد جميع الأطراف. يعتمد التوقيت على المسار الذي نؤكده مسبقًا.",
      },
      {
        q: "هل تحتاج الوكالات إلى تغيير طريقة بيعها؟",
        a: "لا. تحتفظ بعمليتك وعلاقتك مع العميل، ونحن نتولى جانب الدفع.",
      },
    ],
    cta: "ابدأ دفعة عقارية",
    topic: "property",
    more: "خدمات ذات صلة",
  },
  "crypto-click-payments": {
    navLabel: "Crypto Click Payments",
    title: "Crypto Click Payments | مدفوعات فورية بالعملات الرقمية",
    description:
      "Crypto Click Payments من 369 ليميتد: مدفوعات فورية بالعملات الرقمية للعقارات والخدمات والتجارة في الإمارات، مع واجهة API وإعداد للشركات.",
    h1: "Crypto Click Payments",
    intro: "مدفوعات فورية بالعملات الرقمية للعقارات والخدمات والتجارة. بسيطة للمستخدمين ومصمّمة لشركاء الأعمال.",
    sections: [
      {
        h: "ما هي",
        p: [
          "تتيح Crypto Click Payments للمستخدمين والشركات الدفع والاستلام بالأصول الرقمية بسرعة، دون تأخيرات التحويلات التقليدية.",
        ],
      },
      {
        h: "مصمّمة للشركات",
        p: [
          "تحصل الشركات الصغيرة والمتوسطة والناشئة التقنية والوكالات الرقمية وشركات التجارة الإلكترونية والخدمات في دبي والمنطقة على مسار دفع سريع، ودعم وواجهة API لمنصاتها، وإعداد بسيط.",
        ],
      },
      {
        h: "أين تُستخدم",
        p: ["الصفقات العقارية والخدمات المهنية والتجارة الإلكترونية وتجارة الفخامة: حيثما تهمّ السرعة وقاعدة دافعين عالمية."],
      },
      {
        h: "الإعداد",
        p: ["نقدّم الإرشاد التنظيمي والإعداد، ليبدأ فريقك قبول العملات الرقمية دون إعادة بناء منظومة الدفع لديه."],
      },
    ],
    faq: [
      {
        q: "ما هي Crypto Click Payments؟",
        a: "هي حلّ الدفع الفوري من 369 ليميتد. يدفع المستخدمون وشركاء الأعمال ويستلمون بالأصول الرقمية بسرعة، ومنها العقارات والخدمات والتجارة.",
      },
      {
        q: "هل تستطيع شركتي قبول المدفوعات بالعملات الرقمية في الإمارات؟",
        a: "نعم، بالإعداد والفحوص المناسبة. تدعم 369 ليميتد الشركات في الإعداد والإرشاد التنظيمي.",
      },
      {
        q: "هل توجد واجهة API؟",
        a: "الوصول إلى واجهة API ودعم المنصات جزء من العرض لشركاء الأعمال. تواصل مع مكتبنا للتفاصيل التقنية.",
      },
      {
        q: "هل يمكن للعملاء الدفع بـ USDT؟",
        a: "USDT هو أصلنا الأساسي. اسأل مكتبنا عن الأصول الأخرى المدعومة لحالتك.",
      },
    ],
    cta: "تحدّث معنا عن شركتك",
    topic: "business",
    more: "خدمات ذات صلة",
  },
  about: {
    navLabel: "من نحن",
    title: "من نحن | 369 ليميتد شركة تقنية مالية مرخّصة في دبي",
    description:
      "369 ليميتد شركة تقنية مالية في دبي مرخّصة من واحة الأصول الرقمية. تحليل بالذكاء الاصطناعي وتداول الأصول الرقمية وCrypto Click Payments.",
    h1: "من نحن",
    intro: "369 ليميتد شركة تقنية مالية مقرها دبي، تربط الأصول الرقمية بفرص العالم الحقيقي. حيث تلتقي العملات الرقمية بالواقع.",
    sections: [
      {
        h: "من نحن",
        p: [
          "شركة تقنية مالية تقوم على تحليل العملات الرقمية بالذكاء الاصطناعي، وشراء وبيع الأصول الرقمية، وCrypto Click Payments. مرخّصة من واحة الأصول الرقمية (رأس الخيمة) ومقرها شارع الشيخ زايد في دبي.",
        ],
      },
      {
        h: "الرؤية والمهمة",
        p: [
          "رؤيتنا أن نكون المركز الموثوق للتمويل الرقمي في الإمارات والشرق الأوسط، نربط الأسواق التقليدية بالأصول الرقمية عبر تقنية ذكية وآمنة ومتاحة للجميع.",
          "مهمتنا أن نمنح المستثمرين والمتداولين والشركات منظومة متكاملة: تحليلًا استباقيًا للسوق، ومعاملات سريعة وآمنة، وحلول دفع بالعملات الرقمية مصمّمة لاحتياجات حقيقية.",
        ],
      },
      {
        h: "ماذا يعني 369",
        p: ["الاسم مستوحى من التسلسل الرقمي 369. يرمز إلى التوازن والمنطق والتحقّق."],
      },
      {
        h: "زيارتنا",
        p: ["الطابق الأرضي، مكتب 201، برج API World، شارع الشيخ زايد، دبي، الإمارات. ص.ب 414494."],
      },
    ],
    faq: [
      {
        q: "هل 369 ليميتد مرخّصة؟",
        a: "نعم. تعمل 369 ليميتد بترخيص من واحة الأصول الرقمية (رأس الخيمة) ومقرها دبي.",
      },
      { q: "ماذا يعني الرقم 369؟", a: "يرمز إلى التوازن والمنطق والتحقّق، وهي المبادئ التي نعمل بها." },
      {
        q: "أين مقر 369 ليميتد؟",
        a: "الطابق الأرضي، مكتب 201، برج API World، شارع الشيخ زايد، دبي، الإمارات.",
      },
    ],
    cta: "تحدّث مع فريقنا",
    topic: "buy-usdt",
    more: "خدماتنا",
  },
};

export const PAGES: Record<Locale, Record<Slug, PageCopy>> = { en, ar };
export const isSlug = (v: string): v is Slug => (SLUGS as readonly string[]).includes(v);
