use("blasttype")

db.createCollection("challenges")
  
db.challenges.insertMany([
    // ----- DAILY -----
    { period: "daily", type: "wpm", goal: "Reach 70 WPM in a match", targetValue: 70 },
    { period: "daily", type: "wpm", goal: "Maintain 50+ WPM for 3 games", targetValue: 3 },
  
    { period: "daily", type: "accuracy", goal: "Type with 95%+ accuracy once", targetValue: 95 },
    { period: "daily", type: "accuracy", goal: "Stay above 90% accuracy for 2 games", targetValue: 2 },
  
    { period: "daily", type: "games_played", goal: "Complete 5 matches", targetValue: 5 },
    { period: "daily", type: "games_played", goal: "Finish 3 solo practices", targetValue: 3 },
  
    { period: "daily", type: "win", goal: "Win one multiplayer race", targetValue: 1 },
    { period: "daily", type: "win", goal: "Win 2 multiplayer races", targetValue: 2 },
  
    { period: "daily", type: "win_streak", goal: "Win 2 games in a row", targetValue: 2 },
    { period: "daily", type: "win_streak", goal: "Achieve a 3-win streak", targetValue: 3 },
  
    // ----- WEEKLY -----
    { period: "weekly", type: "wpm", goal: "Reach 100 WPM once this week", targetValue: 100 },
    { period: "weekly", type: "wpm", goal: "Maintain 80+ WPM in 5 games", targetValue: 5 },
  
    { period: "weekly", type: "accuracy", goal: "Keep accuracy above 90% for 10 matches", targetValue: 10 },
    { period: "weekly", type: "accuracy", goal: "Hit 98% accuracy once this week", targetValue: 98 },
  
    { period: "weekly", type: "games_played", goal: "Complete 25 games", targetValue: 25 },
    { period: "weekly", type: "games_played", goal: "Play 10 solo practices", targetValue: 10 },
  
    { period: "weekly", type: "win", goal: "Win 5 multiplayer races", targetValue: 5 },
    { period: "weekly", type: "win", goal: "Win 3 games with 90%+ accuracy", targetValue: 3 },
  
    { period: "weekly", type: "win_streak", goal: "Achieve a 4-win streak", targetValue: 4 },
    { period: "weekly", type: "win_streak", goal: "Achieve a 5-win streak", targetValue: 5 },
])