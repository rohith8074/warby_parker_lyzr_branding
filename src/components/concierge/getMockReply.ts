/**
 * Returns a mock assistant reply based on user message content.
 * Replace with your API call in production.
 */
export function getMockReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes("bourbon") || lower.includes("whiskey"))
    return "Great choice! For a smooth everyday bourbon, I'd recommend Elijah Craig Small Batch - rich caramel and vanilla notes with a warm finish. Want me to suggest a cocktail to pair with it?";
  if (
    lower.includes("wedding") ||
    lower.includes("event") ||
    lower.includes("party")
  )
    return "I'd love to help plan your bar! How many guests are you expecting, and do you prefer a full bar or a curated cocktail menu?";
  if (lower.includes("cocktail"))
    return "A classic Old Fashioned is always a crowd-pleaser. Muddle sugar and bitters, add bourbon and a large ice cube, then garnish with an orange peel. Shall I suggest more recipes?";
  return "That's a great question! I can help with spirit recommendations, cocktail recipes, or event planning. What would you like to explore?";
}
