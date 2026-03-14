const PouchDB = require("pouchdb");

const db = new PouchDB("ads_db");

// Seed default empty slots on first run
async function initSlots() {
  for (let i = 1; i <= 6; i++) {
    const id = `slot_${i}`;
    try {
      await db.get(id);
    } catch (err) {
      if (err.status === 404) {
        await db.put({
          _id: id,
          slotNumber: i,
          mediaType: null, // 'image' | 'video' | null
          fileName: null,
          originalName: null,
          filePath: null,
          title: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }
}

async function getAllAds() {
  const result = await db.allDocs({ include_docs: true });
  return result.rows
    .map((row) => row.doc)
    .filter((doc) => doc._id.startsWith("slot_"))
    .sort((a, b) => a.slotNumber - b.slotNumber);
}

async function getAd(slotNumber) {
  try {
    return await db.get(`slot_${slotNumber}`);
  } catch (err) {
    return null;
  }
}

async function upsertAd(slotNumber, data) {
  const id = `slot_${slotNumber}`;
  let doc;
  try {
    doc = await db.get(id);
  } catch {
    doc = { _id: id, slotNumber };
  }

  const updated = {
    ...doc,
    ...data,
    slotNumber,
    updatedAt: new Date().toISOString(),
  };

  return await db.put(updated);
}

async function deleteAd(slotNumber) {
  const id = `slot_${slotNumber}`;
  try {
    const doc = await db.get(id);
    // Reset slot to empty rather than removing the document
    const reset = {
      _id: doc._id,
      _rev: doc._rev,
      slotNumber,
      mediaType: null,
      fileName: null,
      originalName: null,
      filePath: null,
      title: "",
      createdAt: doc.createdAt,
      updatedAt: new Date().toISOString(),
    };
    return await db.put(reset);
  } catch {
    return null;
  }
}

module.exports = { db, initSlots, getAllAds, getAd, upsertAd, deleteAd };
