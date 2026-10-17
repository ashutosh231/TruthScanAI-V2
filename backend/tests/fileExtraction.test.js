import { describe, it } from "node:test";
import assert from "node:assert";
import { extractFileContent } from "../utils/fileExtractor.js";

describe("File Extraction Unit Tests", () => {
  // ==========================================================================
  // Scenario 11: PDF/image/text upload with successful text extraction
  // ==========================================================================
  it("Scenario 11: Successfully extracts text from valid text and PDF buffers", async () => {
    // 1. Text file buffer
    const textFile = {
      originalname: "press_release.txt",
      mimetype: "text/plain",
      size: 1024,
      buffer: Buffer.from(
        "Official announcement: Central scientific authority releases verified telemetry on polar ice caps."
      ),
    };

    const textResult = await extractFileContent(textFile);
    assert.strictEqual(textResult.engine, "Text Buffer Reader");
    assert.match(textResult.text, /Central scientific authority/);

    // 2. Minimal valid PDF buffer containing text
    // A synthetic 1-page PDF
    const pdfData = Buffer.from(
      "%PDF-1.4\n" +
      "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
      "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
      "3 0 obj<</Type/Page/MediaBox[0 0 300 300]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n" +
      "4 0 obj<</Length 44>>stream\n" +
      "BT /F1 12 Tf 100 100 Td (Verified Document Text) Tj ET\n" +
      "endstream\n" +
      "endobj\n" +
      "xref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\n0000000195 00000 n\n" +
      "trailer<</Size 5/Root 1 0 R>>\nstartxref\n290\n%%EOF"
    );

    const pdfFile = {
      originalname: "test_doc.pdf",
      mimetype: "application/pdf",
      size: pdfData.length,
      buffer: pdfData,
    };

    const pdfResult = await extractFileContent(pdfFile);
    assert.strictEqual(pdfResult.engine, "PDF Document Parser");
    assert.ok(pdfResult.text.length >= 5);
  });

  // ==========================================================================
  // Scenario 12: PDF/image upload where extraction fails or produces empty text
  // ==========================================================================
  it("Scenario 12: Fails cleanly with descriptive error if file has no text or is corrupt", async () => {
    // 1. Empty buffer
    const emptyFile = {
      originalname: "blank.txt",
      mimetype: "text/plain",
      size: 0,
      buffer: Buffer.from("   \n\t  "),
    };

    await assert.rejects(
      async () => {
        await extractFileContent(emptyFile);
      },
      (err) => err.message.includes("No legible or sufficient text content")
    );

    // 2. Corrupt PDF buffer
    const corruptPdf = {
      originalname: "damaged.pdf",
      mimetype: "application/pdf",
      size: 20,
      buffer: Buffer.from("Not a real PDF header"),
    };

    await assert.rejects(
      async () => {
        await extractFileContent(corruptPdf);
      },
      (err) => err.message.includes("Failed to parse PDF document")
    );

    // 3. Unsupported file type
    const unsupportedFile = {
      originalname: "archive.zip",
      mimetype: "application/zip",
      size: 50,
      buffer: Buffer.from("PK..."),
    };

    await assert.rejects(
      async () => {
        await extractFileContent(unsupportedFile);
      },
      (err) => err.message.includes("Unsupported file type")
    );
  });
});
