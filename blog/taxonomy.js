/**
 * Blog taxonomy — categories (topic + subtopic)
 * Edit labels here; ids are referenced from blog/registry.json (cat / sub).
 */
window.blogTaxonomy = [
  {
    id: "tech",
    label: "Tech",
    subs: [
      { id: "network", label: "Networking & systems" },
      { id: "kernel",  label: "Kernel & eBPF" },
      { id: "security", label: "Security & firmware" },
    ],
  },
  {
    id: "notes",
    label: "Notes",
    subs: [
      { id: "paper", label: "Paper notes" },
      { id: "idea",  label: "Draft ideas" },
    ],
  },
];
