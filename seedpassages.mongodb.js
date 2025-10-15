use("blasttype")

db.createCollection("passages")

db.passages.insertMany([
    {
      text: "The sun was shining bright as children played in the park. They ran around happily, laughing with each other.",
      difficulty: "easy",
    },
    {
      text: "Tom picked up his book and started reading quietly. He enjoyed stories about adventures and heroes.",
      difficulty: "easy",
    },
    {
      text: "Sarah watered the flowers in her garden. The colorful roses and tulips made her smile.",
      difficulty: "easy",
    },
    {
      text: "The cat jumped onto the couch and curled up to sleep. It purred softly as it closed its eyes.",
      difficulty: "easy",
    },
    {
      text: "Ben opened the window to let in fresh air. The cool breeze made the room feel better.",
      difficulty: "easy",
    },
    {
      text: "The dog wagged its tail when it saw its owner. It was happy to go for a walk.",
      difficulty: "easy",
    },
    {
      text: "Lily painted a picture of a tree. She used green for the leaves and brown for the trunk.",
      difficulty: "easy",
    },
    {
      text: "The boy ate his sandwich quickly. He was hungry after playing outside for hours.",
      difficulty: "easy",
    },
    {
      text: "Anna helped her mother bake cookies. The smell of chocolate filled the kitchen.",
      difficulty: "easy",
    },
    {
      text: "The bird flew high in the sky. Its wings moved quickly as it glided through the air.",
      difficulty: "easy",
    },
  
    // MEDIUM
    {
      text: "The library was silent except for the soft turning of pages. Students were studying hard for their exams.",
      difficulty: "medium",
    },
    {
      text: "On a rainy afternoon, Mia sat by the window, watching raindrops race down the glass.",
      difficulty: "medium",
    },
    {
      text: "David climbed the steep hill, determined to reach the top before sunset.",
      difficulty: "medium",
    },
    {
      text: "The market was crowded with people buying fruits, vegetables, and spices from busy vendors.",
      difficulty: "medium",
    },
    {
      text: "Emily loved solving puzzles. The challenge of fitting pieces together excited her.",
      difficulty: "medium",
    },
    {
      text: "The train sped through the countryside, passing green fields and small villages.",
      difficulty: "medium",
    },
    {
      text: "When the power went out, the family lit candles and told stories in the living room.",
      difficulty: "medium",
    },
    {
      text: "Mark was nervous before giving his speech, but he spoke clearly once he began.",
      difficulty: "medium",
    },
    {
      text: "The boat rocked gently on the calm lake as birds flew overhead.",
      difficulty: "medium",
    },
    {
      text: "Lisa enjoyed hiking in the forest, listening to the sound of leaves crunching under her boots.",
      difficulty: "medium",
    },
  
    // HARD
    {
      text: "The scientist carefully recorded her observations, knowing even the smallest detail could change the outcome of the experiment.",
      difficulty: "hard",
    },
    {
      text: "Despite facing many setbacks, the young entrepreneur remained resilient, constantly adapting to new challenges.",
      difficulty: "hard",
    },
    {
      text: "The old manuscript was written in faded ink, making it difficult to decipher the ancient language.",
      difficulty: "hard",
    },
    {
      text: "As the storm grew stronger, waves crashed violently against the rocks, echoing across the dark shoreline.",
      difficulty: "hard",
    },
    {
      text: "The philosopher pondered the nature of existence, questioning what it truly meant to live a meaningful life.",
      difficulty: "hard",
    },
    {
      text: "The courtroom fell silent as the lawyer presented her final argument, weaving evidence into a compelling story.",
      difficulty: "hard",
    },
    {
      text: "Deep in the rainforest, the explorers discovered a hidden waterfall surrounded by rare plants and animals.",
      difficulty: "hard",
    },
    {
      text: "His determination to succeed was fueled not by fame, but by the desire to create lasting change in society.",
      difficulty: "hard",
    },
    {
      text: "The architect designed a building that blended modern innovation with historical tradition.",
      difficulty: "hard",
    },
    {
      text: "With every passing year, technology advanced at a rapid pace, reshaping industries and human interactions.",
      difficulty: "hard",
    },
  ])