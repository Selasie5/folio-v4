import { createClient } from "@sanity/client";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "./env";

export const sanityClient = sanityProjectId
  ? createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      // Read straight from the API in dev so Studio edits show on the next reload.
      useCdn: process.env.NODE_ENV === "production",
    })
  : null;
