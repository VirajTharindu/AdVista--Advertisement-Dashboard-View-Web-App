# AdVista: Key Design Decisions

This document encapsulates the UI/UX architecture choices and visual logic applied across the **AdVista** digital billboard dashboard.

## 1. The 6-Slot Rigid Grid System
**Concept:** Instead of an infinite masonry scroll or a single carousel timeline, the dashboard natively occupies exactly 6 quadrants. 

**Reasoning:**
- **Hardware Predictability:** Most commercial digital displays scale perfectly at 16:9 1080p or 4K. A structured grid provides exact pixel predictability, ensuring advertisers know precisely where and how their media will render without CSS wrapping surprises.
- **Cognitive Load:** 6 distinct slots provide maximum visibility without overwhelming the spectator's visual registry.

## 2. Dark Mode By Default (Black Canvas)
**Concept:** The global application canvas is strictly mapped to `bg-black`.

**Reasoning:**
- **Contrast & Vibrancy:** In physical installations (LED/LCD boards in stadiums or thoroughfares), deep blacks allow the physical media (videos/images) to act as the sole source of illumination.
- **Bleed Reduction:** Padding around slots blends cleanly into the physical bezel of the monitor.

## 3. Atomic Component Structure (AdSlot)
**Concept:** Treating each slot `[<AdSlot />]` as a highly isolated logic tree capable of governing its own video looping, image fading, and real-time state consumption.

**Reasoning:**
- Rather than a massive parent component re-rendering the entire board upon one WebSocket ping, isolating the props to the `AdSlot` ensures that when slot #3 receives new media, slots #1, #2, #4, #5, and #6 do not experience micro-stutters or rerender flashes.

## 5. Modern Typography & Subdued UI
**Concept:** Utilizing Next.js `next/font` for sleek sans-serif typography (e.g., Geist) on the administrative text.

**Reasoning:**
- Ensuring the dashboard wrapper feels premium and invisible, allowing the injected advertisement media to completely dominate the viewer's attention.
