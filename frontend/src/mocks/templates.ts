import { TemplateDTO, TemplateSchema } from "../types/portfolio";

const classicSchema: TemplateSchema = {
  sections: [
    {
      key: "about",
      label: "About",
      fields: [
        { key: "name", type: "text" },
        { key: "headline", type: "text" },
        { key: "summary", type: "multiline" },
        { key: "photo", type: "image" },
      ],
    },
    {
      key: "experience",
      label: "Experience",
      repeatable: true,
      fields: [
        { key: "role", type: "text" },
        { key: "company", type: "text" },
        { key: "start", type: "date" },
        { key: "end", type: "date" },
        { key: "desc", type: "multiline" },
      ],
    },
    {
      key: "projects",
      label: "Projects",
      repeatable: true,
      fields: [
        { key: "name", type: "text" },
        { key: "link", type: "url" },
        { key: "tech", type: "chips" },
        { key: "summary", type: "multiline" },
      ],
    },
    {
      key: "skills",
      label: "Skills",
      fields: [{ key: "items", type: "chips" }],
    },
  ],
};

export const MOCK_TEMPLATES: TemplateDTO[] = [
  {
    key: "classic",
    name: "Classic",
    description: "Clean resume-to-portfolio template.",
    schema: classicSchema,
    default_theme: {
      "--bg": "#ffffff",
      "--fg": "#0f172a",
      "--accent": "#6366f1",
      "--font": "Inter",
    },
    preview_image: "",
  },
  {
    key: "modern",
    name: "Modern",
    description: "Bold, dark hero with cards.",
    // reuse the same schema for now
    schema: classicSchema,
    default_theme: {
      "--bg": "#0b1020",
      "--fg": "#e5e7eb",
      "--accent": "#a78bfa",
      "--font": "General Sans",
    },
    preview_image: "",
  },
];
