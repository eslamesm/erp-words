import { describe, it, expect } from "vitest";
import { assistantRespond, assistantReply } from "@/lib/assistantEngine";

describe("assistantRespond", () => {
  it("returns empty text for blank input", () => {
    expect(assistantRespond("").text).toBe("");
  });

  it("explains a known word and offers it for SRS rating", () => {
    const r = assistantRespond("Explain invoice");
    expect(r.text.toLowerCase()).toContain("invoice");
    expect(r.wordIds).toHaveLength(1);
  });

  it("corrects a sentence with a common mistake", () => {
    const r = assistantRespond("Correct: I have informations");
    expect(r.text).toContain("information");
  });

  it("returns a professional email template for a matching topic", () => {
    const r = assistantRespond("Write an approval email");
    expect(r.text.toLowerCase()).toContain("subject");
    expect(r.text.toLowerCase()).toContain("approval");
  });

  it("offers interview practice", () => {
    const r = assistantRespond("Interview practice");
    expect(r.text.toLowerCase()).toContain("interview");
  });

  it("returns a random word for practice", () => {
    const r = assistantRespond("Random word");
    expect(r.wordIds).toHaveLength(1);
  });

  it("always suggests follow-up chips", () => {
    const r = assistantRespond("hello there");
    expect(r.chips && r.chips.length).toBeGreaterThan(0);
  });

  it("greets back in Arabic", () => {
    expect(assistantRespond("مرحبا").text).toContain("مرحبًا");
  });

  it("responds to the Islamic greeting", () => {
    expect(assistantRespond("السلام عليكم").text).toContain("وعليكم السلام");
  });

  it("greets back in English", () => {
    expect(assistantRespond("hello").text.toLowerCase()).toContain("hello");
  });

  it("assistantReply returns the plain text", () => {
    expect(assistantReply("Explain invoice")).toBe(assistantRespond("Explain invoice").text);
  });
});
