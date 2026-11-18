// Shared by the post sync scripts: back up exactly the documents a sync will overwrite,
// and only overwrite them if they still match that backup.

/** The current versions of the documents the sync is about to write, keyed by ID. */
export async function fetchTargets(client, documents) {
  const ids = documents.map(({ _id }) => _id);
  const current = await client.fetch(`*[_id in $ids]`, { ids });
  return new Map(current.map((document) => [document._id, document]));
}

/**
 * Adds one write per document: create it if it's new, otherwise update it in place,
 * guarded by the revision in the backup. If anything changed after the backup was taken
 * (for example a Studio edit), the whole transaction is rejected and nothing is written.
 */
export function addGuardedWrites(transaction, documents, targets) {
  for (const document of documents) {
    const previous = targets.get(document._id);
    if (!previous) {
      transaction = transaction.create(document);
      continue;
    }
    const { _id, _type, ...fields } = document;
    // Never repurpose a document of another type that happens to use this ID.
    if (previous._type !== _type) {
      throw new Error(`Document ${_id} already exists as "${previous._type}", not "${_type}"; refusing to overwrite it.`);
    }
    // Fields the source no longer has (e.g. a removed cover image) are cleared, like a replace.
    const removed = Object.keys(previous).filter((key) => !key.startsWith("_") && !(key in fields));
    transaction = transaction.patch(_id, (patch) => {
      let guarded = patch.ifRevisionId(previous._rev).set(fields);
      if (removed.length) guarded = guarded.unset(removed);
      return guarded;
    });
  }
  return transaction;
}

/** Turns a revision-mismatch rejection into a clear message. */
export function explainWriteError(error) {
  if (error?.statusCode === 409 || /revision/i.test(error?.message ?? "")) {
    return new Error("A post changed in Sanity after the backup was taken, so nothing was written. Run the sync again.");
  }
  return error;
}
