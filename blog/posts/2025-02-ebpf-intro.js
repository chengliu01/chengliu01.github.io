window.currentPost = {
  title:   "eBPF in five minutes (no, it is not JavaScript in the kernel)",
  date:    "Feb 8, 2025",
  tags:    ["eBPF", "Linux", "Tutorial"],
  content: `
## What is eBPF?

A sandboxed VM inside the Linux kernel. You attach small programs to tracepoints, kprobes, sockets, XDP, TC, etc. A verifier rejects unsafe code; **maps** share data with userspace.

## Minimal mental model

1. Pick a hook (e.g. a syscall tracepoint).
2. Compile an eBPF program and load it.
3. Read counters or logs from maps in userspace.

## Tooling

\`bpftrace\` for one-liners, BCC/libbpf for heavier work, cilium/ebpf from Go when you ship daemons.

---

*Next step: a tiny packet counter with maps—if there is interest I will sketch the code path.*
  `,
};
