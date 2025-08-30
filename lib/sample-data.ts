import type { EventItem } from "@/types/event"

export const events: EventItem[] = [
  {
    id: "e-101",
    title: "AI in Practice — Workshop",
    club: "Tech Club",
    date: "2025-09-12",
    time: "16:00",
    venue: "Auditorium A",
    quota: 60,
    registered: 42,
    description: "Hands-on session covering real-world AI applications, demos, and Q&A. FCFS with a quota of 60 seats.",
  },
  {
    id: "e-102",
    title: "Design Systems 101",
    club: "Design Collective",
    date: "2025-10-02",
    time: "11:00",
    venue: "Lab 3",
    quota: 40,
    registered: 28,
    description:
      "Intro to design systems, tokens, and accessibility. Learn how consistent design accelerates product delivery.",
  },
  {
    id: "e-103",
    title: "Marketing Analytics Deep-Dive",
    club: "Biz Club",
    date: "2025-10-10",
    time: "14:00",
    venue: "Seminar Hall",
    quota: 80,
    registered: 77,
    description: "From funnels to attribution models. A practical session to understand what drives conversion.",
  },
]
