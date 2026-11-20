export const portfolioQuery = `*[_type == "portfolio" && _id == "portfolio"][0]{
  organizationsHeading,
  "organizations": organizations[]{
    name,
    "logo": logo.asset->url,
    url
  },
  "profile": {
    "name": profile.name,
    "role": profile.role,
    "image": coalesce(profile.image.asset->url, "/seps-anime.png"),
    "bio": profile.bio,
    "bioLinks": profile.bioLinks[]{label, href, brand},
    "quote": profile.quote,
    "quoteSource": profile.quoteSource
  },
  "projects": projects[]{
    title,
    repo,
    live,
    description,
    "image": coalesce(image.asset->url, "/assets/pu.jpg"),
    "logo": coalesce(logo.asset->url, "/assets/project.png"),
    category,
    featured
  },
  // Confidential roles are emptied here, inside Sanity, so their details never reach the site at all.
  "experiences": experiences[]{..., "hidden": confidential == true || _key in $confidentialExperienceKeys}[]{
    "confidential": hidden,
    "role": select(hidden => "", role),
    "company": select(hidden => "", company),
    "logo": select(hidden => "", coalesce(logo.asset->url, "/assets/project.png")),
    "period": select(hidden => "", period),
    "achievements": select(hidden => [], achievements),
    "techStack": select(hidden => [], techStack)
  },
  "certifications": certifications[]{
    title,
    issuer,
    issuedDate,
    "logo": coalesce(logo.asset->url, "/assets/project.png"),
    url
  },
  techStack,
  "contacts": contacts[]{label, display, href}
}`;
