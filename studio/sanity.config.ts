import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";

if (!projectId) {
  throw new Error("Missing SANITY_STUDIO_PROJECT_ID in studio/.env");
}

export default defineConfig({
  name: "portfolio",
  title: "Selasie Sepenu — Portfolio",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Portfolio")
              .id("portfolio")
              .child(S.document().schemaType("portfolio").documentId("portfolio")),
            S.documentTypeListItem("post").title("Posts"),
            S.listItem()
              .title("Side Quests")
              .id("sideQuests")
              .schemaType("sideQuest")
              .child(S.documentTypeList("sideQuest").title("Side Quests").defaultOrdering([{ field: "order", direction: "asc" }])),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => schemaType !== "portfolio"),
  },
});
