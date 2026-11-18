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
            S.listItem()
              .title("Videos")
              .id("videos")
              .schemaType("video")
              .child(S.documentTypeList("video").title("Videos").defaultOrdering([{ field: "order", direction: "asc" }])),
            S.listItem()
              .title("Confidential content")
              .id("confidentialContent")
              .schemaType("sideQuestPrivate")
              .child(
                S.documentList()
                  .title("Confidential content")
                  .apiVersion("2026-09-20")
                  // Only dotted IDs are private; never list anything else here.
                  .filter('_type == "sideQuestPrivate" && _id in path("confidential.**")'),
              ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    // Portfolio is a singleton; confidential documents must be created with a "confidential." ID by script.
    templates: (templates) => templates.filter(({ schemaType }) => !["portfolio", "sideQuestPrivate"].includes(schemaType)),
  },
  document: {
    // Duplicating a confidential document would give the copy a normal, public ID.
    actions: (actions, { schemaType }) =>
      schemaType === "sideQuestPrivate" ? actions.filter(({ action }) => action !== "duplicate") : actions,
    newDocumentOptions: (items) => items.filter(({ templateId }) => templateId !== "sideQuestPrivate"),
  },
});
