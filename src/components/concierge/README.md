# Concierge Chat

Reusable liquid-glass chat widget: floating pill (bottom-right), centered modal, mock replies. All styles and behavior are self-contained.

## Use in this project

```tsx
import { ConciergeChat } from "@/components/concierge/ConciergeChat";

<ConciergeChat />
```

Optional config:

```tsx
<ConciergeChat
  title="Concierge"
  placeholder="Ask anything..."
  pillLabel="Concierge"
  pillHoverLabel="Plan your event"
  initialMessage="Hello! How can I help?"
/>
```

## Reuse in another project

1. **Copy the folder**  
   Copy the entire `concierge` folder into the other project (e.g. `src/components/concierge/`).

2. **Dependencies**  
   The UI uses `lucide-react` for icons. Install if needed:
   ```bash
   pnpm add lucide-react
   ```

3. **Import the component**  
   Styles are imported inside `ConciergeChat.tsx` (via `./concierge.css`), so you only need to render the component:
   ```tsx
   import { ConciergeChat } from "@/components/concierge/ConciergeChat";
   <ConciergeChat />
   ```

4. **Optional: theme via CSS variables**  
   Override in your global CSS or a wrapper:
   ```css
   :root {
     --concierge-accent: 217 71% 58%;
     --concierge-user-bg: 217 71% 58%;
     --concierge-user-fg: 0 0% 100%;
     --concierge-glass-shadow: 224 27% 35% / 0.34;
     --concierge-foreground: #000000;
     --concierge-muted-foreground: #444444;
     --concierge-background: #ffffff;
   }
   ```

5. **Lyzr chat (client-side)**  
   Concierge calls the Lyzr chat API from the browser. Set `NEXT_PUBLIC_LYZR_API_KEY` in `.env`. The key is visible to the client; use a key restricted to the Lyzr agent if needed.

## Files

| File | Purpose |
|------|--------|
| `ConciergeChat.tsx` | Main component; imports `concierge.css` |
| `concierge.css` | Glass UI, animations, pill hover (all design) |
| `types.ts` | `ConciergeMessage`, `ConciergeConfig` |
| `constants.ts` | Default initial message and message list |
| `getMockReply.ts` | Mock reply logic (replace with API) |
