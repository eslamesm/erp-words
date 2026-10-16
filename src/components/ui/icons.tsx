import React from "react";

type P = { size?: number };
const base = (size = 24) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const IconHome = ({ size }: P) => (<svg {...base(size)}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>);
export const IconBook = ({ size }: P) => (<svg {...base(size)}><path d="M3 5h7a2 2 0 012 2v13a2 2 0 00-2-2H3z" /><path d="M21 5h-7a2 2 0 00-2 2v13a2 2 0 012-2h7z" /></svg>);
export const IconTarget = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></svg>);
export const IconUser = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></svg>);
export const IconChat = ({ size }: P) => (<svg {...base(size)}><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" /></svg>);
export const IconMic = ({ size }: P) => (<svg {...base(size)}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></svg>);
export const IconTranslate = ({ size }: P) => (<svg {...base(size)}><path d="M4 5h9M8.5 3v2M6 5c1 4 3 7 6 9M11 5c-1 4-3 7-7 9" /><path d="M14 21l4-10 4 10M15.5 18h5" /></svg>);
export const IconKeyboard = ({ size }: P) => (<svg {...base(size)}><rect x="2.5" y="6" width="19" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" /></svg>);
export const IconBell = ({ size }: P) => (<svg {...base(size)}><path d="M6 16V11a6 6 0 1112 0v5l2 2H4z" /><path d="M10 21h4" /></svg>);
export const IconBack = ({ size }: P) => (<svg {...base(size)}><path d="M15 5l-7 7 7 7" /></svg>);
export const IconMore = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>);
export const IconSettings = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></svg>);
export const IconInfo = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>);
export const IconGlobe = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>);
export const IconSend = ({ size }: P) => (<svg {...base(size)}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>);
export const IconMenu = ({ size }: P) => (<svg {...base(size)}><path d="M4 6h16M4 12h16M4 18h16" /></svg>);
export const IconSpeaker = ({ size }: P) => (<svg {...base(size)}><path d="M11 5L6 9H3v6h3l5 4z" /><path d="M15.5 8.5a5 5 0 010 7M18 6a9 9 0 010 12" /></svg>);
export const IconStop = ({ size }: P) => (<svg {...base(size)}><rect x="6" y="6" width="12" height="12" rx="2" /></svg>);
