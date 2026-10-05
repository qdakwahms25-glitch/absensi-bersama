import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom does not implement the Pointer Capture API that Radix UI primitives
// (Select, Dialog, …) call when a trigger is clicked. Without these stubs the
// click throws `target.hasPointerCapture is not a function` and the popup never
// opens, so every Select-driven journey fails for a harness reason rather than
// an application one.
if (typeof Element !== "undefined") {
  const proto = Element.prototype as Element & {
    hasPointerCapture?: (pointerId: number) => boolean;
    setPointerCapture?: (pointerId: number) => void;
    releasePointerCapture?: (pointerId: number) => void;
    scrollIntoView?: () => void;
  };
  proto.hasPointerCapture ??= () => false;
  proto.setPointerCapture ??= () => {};
  proto.releasePointerCapture ??= () => {};
  proto.scrollIntoView ??= () => {};
}

// jsdom does not implement the object-URL API the Rekap export uses to trigger
// a download. Stub it so the export journey can assert the actor call and the
// resulting anchor without a real browser download.
if (typeof URL !== "undefined") {
  URL.createObjectURL ??= () => "blob:test";
  URL.revokeObjectURL ??= () => {};
}

afterEach(() => {
  cleanup();
});
