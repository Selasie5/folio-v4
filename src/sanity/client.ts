import { createClient } from "@sanity/client";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "./env";

export const sanityClient = sanityProjectId
  ? createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      useCdn: true,
    })
  : null;
