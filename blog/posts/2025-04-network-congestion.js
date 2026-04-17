window.currentPost = {
  title:   "Congestion control: from TCP Cubic to reinforcement learning",
  date:    "Apr 15, 2025",
  tags:    ["Network", "RL", "Research"],
  content: `
## Why is congestion control hard?

Senders must probe the network without global knowledge. Classical schemes (AIMD, Cubic, BBR) bake in assumptions; when the path changes—Wi‑Fi, satellite, datacenter bursts—those assumptions slip.

## Cubic in one paragraph

Cubic replaces additive increase with a cubic function of time since the last loss, improving high-BDP paths. It still treats loss (or delay in BBR’s case) as the main signal.

## Where RL fits

You can frame rate updates as actions from RTT/loss features. Training is easy in simulation; deployment is harder: reward design, safety, and out-of-distribution paths remain open problems.

---

*Ping me if you work on RL for transport—happy to compare notes.*
  `,
};
