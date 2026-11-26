// Funniest Cat Voicemail Greeting — main.ts
//
// Writes one voicemail greeting, recorded as if by a cat, to
// $MAKEFUN_OUTPUT_DIR/entry.txt (or /output/entry.txt when unset).
//
// The greeting (120 characters, at the gate's limit):
//   "Hi, you've reached Mittens. I'm napping on your clean laundry.
//    Leave a message after the beep, or better, open the tuna."
// Mittens answers her own phone: she is asleep on the clean laundry,
// she will not call back, and the caller can pay in tuna instead.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry: exactly one line, 120 characters, plain text.
const GREETING =
  "Hi, you've reached Mittens. I'm napping on your clean laundry. Leave a message after the beep, or better, open the tuna.";

function resolveOutputDir(): string {
  const envDir = process.env.MAKEFUN_OUTPUT_DIR;
  if (envDir && envDir.trim().length > 0) {
    return envDir;
  }
  return "/output";
}

function passesGate(text: string): boolean {
  // Gate: UTF-8 text of 1 to 120 characters, not only whitespace,
  // a single line (no line breaks inside the greeting).
  if (text.length < 1 || text.length > 120) return false;
  if (text.trim().length === 0) return false;
  if (text.includes("\n") || text.includes("\r")) return false;
  return true;
}

function main(): void {
  if (!passesGate(GREETING)) {
    throw new Error(
      `greeting failed the gate (length ${GREETING.length}): ${JSON.stringify(GREETING)}`,
    );
  }
  const dir = resolveOutputDir();
  // Make the output folder if it is missing. Never remove it: the
  // grader mounts it, and deleting a mounted folder fails.
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "entry.txt");
  // Write exactly the greeting, with no trailing newline, so the file
  // holds precisely 120 bytes.
  writeFileSync(file, GREETING, "utf8");
  // Read the file back and confirm the disk holds exactly the greeting
  // we meant to submit, byte for byte as well as character for
  // character, so a silent write failure or an encoding surprise at
  // the 120-character cap can never pass as a valid entry.
  const onDisk = readFileSync(file, "utf8");
  if (onDisk !== GREETING) {
    throw new Error(
      `entry mismatch after write: expected ${JSON.stringify(GREETING)}, got ${JSON.stringify(onDisk)}`,
    );
  }
  if (Buffer.byteLength(onDisk, "utf8") !== Buffer.byteLength(GREETING, "utf8")) {
    throw new Error(
      `entry byte length mismatch after write: expected ${Buffer.byteLength(GREETING, "utf8")}, got ${Buffer.byteLength(onDisk, "utf8")}`,
    );
  }
  console.log(
    `wrote ${GREETING.length}-character (${Buffer.byteLength(GREETING, "utf8")}-byte) greeting to ${file}`,
  );
}

main();
