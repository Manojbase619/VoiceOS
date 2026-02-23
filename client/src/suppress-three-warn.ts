// Must load before any component that imports Three.js. Suppresses THREE.Clock deprecation warning.
const orig = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].includes("THREE.Clock") && args[0].includes("deprecated")) return;
  orig.apply(console, args);
};
