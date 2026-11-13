// Ícones em SVG (traço herda currentColor)
const base = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const BookIcon = (p) => (
  <svg {...base} {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /><path d="M8 7h8M8 11h6" /></svg>
);
export const CompassIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="10" /><path d="M16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3z" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>
);
export const AnchorIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="5" r="2.5" /><path d="M12 7.5V22M8 11h8" /><path d="M4 14a8 8 0 0 0 16 0" /><path d="M2 15l2-2 2 2M18 15l2-2 2 2" /></svg>
);
export const ScrollIcon = (p) => (
  <svg {...base} {...p}><path d="M6 3h12a2 2 0 0 1 2 2v1H8" /><path d="M8 6v13a2 2 0 0 1-4 0v-2h4" /><path d="M8 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6" /><path d="M11 10h6M11 14h5" /></svg>
);
