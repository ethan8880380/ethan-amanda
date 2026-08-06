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
    time: "Exact time TBD",
  },

  venue: {
    ceremony: {
      name: "Cross and Crown Church",
      address: "",
      city: "Seattle, WA",
      mapUrl: "https://maps.google.com",
      notes: "Ceremony begins promptly — please arrive 15 minutes early.",
    },
    reception: {
      name: "Rosehill Community Center",
      address: "",
      city: "Mukilteo, WA",
      mapUrl: "https://maps.google.com",
      notes: "Dinner, dancing, and drinks to follow.",
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
        time: "3:30 PM",
        title: "Guest arrival",
        description: "TODO: Where guests should gather before the ceremony.",
      },
      {
        time: "4:00 PM",
        title: "Ceremony",
        description: "TODO: Brief note about the ceremony.",
      },
      {
        time: "5:00 PM",
        title: "Cocktail hour",
        description: "TODO: Drinks, photos, mingling.",
      },
      {
        time: "6:30 PM",
        title: "Dinner & toasts",
        description: "TODO: Meal style, speeches, etc.",
      },
      {
        time: "8:00 PM",
        title: "Dancing",
        description: "TODO: Party details — open bar, playlist vibes, etc.",
      },
    ],
  },

  travel: {
    eyebrow: "Travel & stay",
    title: "Getting there",
    intro:
      "TODO: A short note for out-of-town guests — nearest airport, driving tips, etc.",
    hotels: [
      {
        name: "Hotel Name",
        detail: "TODO: Room block code, rate, cutoff date",
        url: "#",
      },
      {
        name: "Second Hotel",
        detail: "TODO: Alternate option nearby",
        url: "#",
      },
    ],
    parking: "TODO: Parking details for the venue.",
  },

  registry: {
    eyebrow: "Registry",
    title: "Gifts",
    intro:
      "Your presence is the best gift. If you'd like to celebrate with something more, we've registered at the places below.",
    links: [
      { label: "Registry One", url: "#" },
      { label: "Registry Two", url: "#" },
      { label: "Honeymoon fund", url: "#" },
    ],
  },

  faq: {
    eyebrow: "FAQ",
    title: "A few things to know",
    items: [
      {
        question: "What should I wear?",
        answer: "TODO: Dress code — e.g. cocktail attire, garden formal, etc.",
      },
      {
        question: "Can I bring a plus one?",
        answer:
          "TODO: Plus-one policy — usually based on the invitation.",
      },
      {
        question: "Are kids welcome?",
        answer: "TODO: Kids policy.",
      },
      {
        question: "When should I RSVP by?",
        answer: "TODO: RSVP deadline — e.g. Month Day, Year.",
      },
    ],
  },

  rsvp: {
    eyebrow: "RSVP",
    title: "Will you be there?",
    intro: "Please let us know if you can make it. We can't wait to celebrate with you.",
    deadline: "TODO: Kindly reply by Month Day, Year.",
    successYes: "We can't wait to see you there!",
    successNo: "We'll miss you — thank you for letting us know.",
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
