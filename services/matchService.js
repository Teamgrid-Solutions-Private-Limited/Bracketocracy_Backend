// Define the order of rounds in the tournament
const roundOrder = [
  { name: "round 1", slug: "round-1" },
  { name: "round 2", slug: "round-2" },
  { name: "sweet 16", slug: "round-3" },
  { name: "elite 8", slug: "round-4" },
  { name: "final 4", slug: "round-5" },
  { name: "final (championship game)", slug: "round-6" },
];

// Function to generate round slug based on round index
const generateRoundSlug = (roundIndex) => {
  if (roundIndex < 0 || roundIndex >= roundOrder.length) {
    return null; // Return null if round index is invalid
  }
  return roundOrder[roundIndex].slug;
};

// Function to extract winners from completed matches and organize them by zone
const getWinnersFromCompletedMatches = (completedMatches) => {
  const winnersByZone = {};

  completedMatches.forEach((match) => {
    const zoneSlug = match.zoneSlug;
    const decidedWinner = match.decidedWinner;

    // If zone does not exist in winnersByZone, initialize an empty array
    if (!winnersByZone[zoneSlug]) {
      winnersByZone[zoneSlug] = [];
    }

    // Push the winner into the appropriate zone
    winnersByZone[zoneSlug].push(decidedWinner);
  });

  return winnersByZone;
};

module.exports = {
  roundOrder,
  generateRoundSlug,
  getWinnersFromCompletedMatches,
};
