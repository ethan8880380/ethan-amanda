/**
 * Wedding website content — edit this file to fill in your details.
 * Anything marked with TODO is a placeholder waiting for real info.
 */

export const weddingContent = {
  couple: {
    partnerOne: "Ethan",
    partnerTwo: "Amanda",
    short: "Ethan & Amanda",
  },

  date: {
    display: "Saturday, January 23, 2027",
    short: "January 23, 2027",
    iso: "2027-01-23",
    time: "Ceremony at 1:00 PM",
  },

  venue: {
    ceremony: {
      name: "Cross and Crown Church",
      address: "4554 12th Ave NE",
      city: "Seattle, WA",
      mapUrl:
        "https://www.google.com/maps/search/?api=1&query=4554+12th+Ave+NE+Seattle+WA+98105",
      notes:
        "Arrive 15 minutes before 1:00. A parking garage is across the street.",
    },
    reception: {
      name: "Rosehill Community Center",
      address: "304 Lincoln Ave",
      city: "Mukilteo, WA",
      mapUrl:
        "https://www.google.com/maps/search/?api=1&query=304+Lincoln+Ave+Mukilteo+WA+98275",
      notes: "Plenty of parking on site.",
    },
    sameLocation: false,
  },

  hero: {
    eyebrow: "We're getting married",
    headline: "Ethan & Amanda",
    subhead: "Join us as we celebrate a lifetime together.",
    cta: "RSVP",
    image: "/wedding/wedding-04.png",
  },

  saveTheDate: {
    eyebrow: "Save the date",
    headline: "We're getting married",
    guestInviteLine:
      "We can't wait to celebrate with you. Hold the date — a proper invitation is on its way.",
    subhead:
      "We're so glad you're part of our story. Formal invitations with all the details will follow.",
    guestSubhead:
      "Leave your mailing address and we'll send your invitation when the time comes.",
    image: "/wedding/wedding-04.png",
    addressIntro:
      "One address for your household is perfect.",
    allergiesIntro:
      "Any food allergies or dietary restrictions we should know about for your household?",
    addressThanks: "You're all set — thank you. We'll send your invitation here.",
    cityHint: "Seattle & Mukilteo",
  },

  story: {
    eyebrow: "Our story",
    title: "How we got here",
    paragraphs: [
      "TODO: A short paragraph about how you met — keep it warm and personal.",
      "TODO: A second paragraph about the proposal or what this day means to you.",
    ],
    image: "/wedding/wedding-02.png",
  },

  schedule: {
    eyebrow: "The day",
    title: "Celebration timeline",
    items: [
      {
        time: "1:00 PM",
        title: "Ceremony",
        description: "The ceremony begins promptly at 1:00.",
      },
      {
        time: "After",
        title: "Cocktail hour",
        description: "Head to the reception when the ceremony ends.",
      },
      {
        time: "4:00 PM",
        title: "Dinner",
        description: "A buffet around 4:00–4:30.",
      },
      {
        time: "Later",
        title: "Toasts & dancing",
        description:
          "Toasts and dancing follow dinner. The evening ends around 10:00 or 11:00.",
      },
    ],
  },

  travel: {
    eyebrow: "Travel & stay",
    title: "Getting there",
    intro:
      "About a half hour north from the ceremony to the reception. Sea-Tac is the larger airport. Paine Field, in Everett, is the closer option.",
    hotels: [
      {
        name: "Silver Cloud Hotel — Mukilteo Waterfront",
        detail:
          "On the waterfront, a short distance from the reception. Book directly with the hotel.",
        url: "https://www.silvercloud.com/mukilteo/",
      },
    ],
    parking: "",
  },

  registry: {
    eyebrow: "Registry",
    title: "Gifts",
    intro:
      "Being there is the gift. If you'd like to mark the day with something more, we registered in one place.",
    pageIntro:
      "We gathered everything in one registry — a honeymoon fund, things for the house, and a few experiences. Checkout happens on Zola.",
    url: "https://www.zola.com/registry/ethanandamandajanuary23",
    teaserCta: "See the registry",
    cta: "Browse the full registry",
    ctaShort: "Zola",
    successCta: "We've registered with Zola",
    rsvpPrompt: {
      title: "Have you RSVP'd yet?",
      body: "Before you head to the registry, let us know if you can make it. It only takes a minute.",
      rsvpCta: "RSVP first",
      continueCta: "Continue to the registry",
    },
    /** Each item can set `url` to a specific Zola collection; otherwise it uses `registry.url`. */
    featured: [
      {
        label: "Honeymoon",
        detail:
          "A contribution toward the trip — getting there, dinners, days off.",
      },
      {
        label: "Home",
        detail: "Pieces we'd use every day, from the kitchen to the table.",
      },
      {
        label: "Experiences",
        detail: "Things to do together after the wedding, not things to unwrap.",
      },
    ],
  },

  faq: {
    eyebrow: "FAQ",
    title: "A few things to know",
    items: [
      {
        question: "What should I wear?",
        answer: "Formal.",
        images: [
          {
            src: "/wedding/attire-men.jpg",
            alt: "A man in a dark formal suit, seen from behind.",
            label: "Men",
          },
          {
            src: "/wedding/attire-women.jpg",
            alt: "A woman in a floor-length formal dress, seen from behind.",
            label: "Women",
          },
        ],
      },
      {
        question: "Can I bring a plus one?",
        answer:
          "If your invitation includes a plus one, they'll be listed with your group.",
      },
      {
        question: "Are kids welcome?",
        answer:
          "Kids will not be at the reception. If you need an exception, let us know.",
      },
      {
        question: "When should I RSVP by?",
        answer: "Please reply by December 15, 2026.",
      },
    ],
  },

  rsvp: {
    eyebrow: "RSVP",
    title: "Will you be there?",
    intro:
      "Start typing your name, then choose your group and reply for each person.",
    groupIntro:
      "Reply for each person below.",
    openIntro:
      "Reply for yourself, or add each person you're answering for.",
    deadline: "Kindly reply by December 15, 2026.",
    thanksEyebrow: "RSVP",
    thanksTitle: "Thank you",
    successYes: "We can't wait to see you there.",
    successNo: "We'll miss you — thank you for letting us know.",
    thanksRegistry:
      "If you'd like to celebrate with a gift, we've registered with Zola.",
  },

  footer: {
    note: "With love,",
    year: "2027",
  },

  gallery: [
    "/wedding/wedding-01.png",
    "/wedding/wedding-02.png",
    "/wedding/wedding-03.png",
    "/wedding/wedding-04.png",
    "/wedding/wedding-05.png",
    "/wedding/wedding-06.png",
    "/wedding/wedding-07.png",
  ],
} as const;

export type WeddingContent = typeof weddingContent;
