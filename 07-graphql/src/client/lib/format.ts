export const stars = (rating: number) => "★".repeat(rating);

export const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;
