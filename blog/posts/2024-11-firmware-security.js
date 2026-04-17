window.currentPost = {
  title:   "Firmware security patterns we kept seeing in the wild",
  date:    "Nov 22, 2024",
  tags:    ["Security", "Firmware", "Embedded"],
  content: `
## Defaults and backdoors

Factory credentials and telnet left on are still common. Treat **first-boot password change** and **no debug UART in production** as table stakes.

## Unsigned updates

If updates only check CRC, attackers can swap images. Prefer **signed** bundles with keys anchored in ROM or secure boot.

## Stale dependencies

Old OpenSSL / BusyBox builds drag known CVEs. Track a **software bill of materials** and patch on a schedule.

## Debug interfaces

JTAG/UART shells bypass higher layers. Blow fuses where possible; password-gate serial consoles.

---

*These notes summarize patterns from lab experiments—not a specific vendor disclosure.*
  `,
};
