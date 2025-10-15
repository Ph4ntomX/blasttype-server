const express = require("express");

const router = express.Router();
const Controller = require("../controllers/passage");

router.get("/", async (req, res) => {
  try {
    const passages = await Controller.getPassages({difficulty: req.query.difficulty, search: req.query.search});

    if (!passages) {
      return res.status(404).send("Passages were not found");
    }
    
    res.status(200).send(passages);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/random", async (req, res) => {
  try {
    const difficulty = req.query.difficulty;

    const passage = await Controller.randomPassage({difficulty});

    if (!passage) {
      return res.status(404).send("Passage was not found");
    }
    
    res.status(200).send(passage);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const passage = await Controller.getPassageById(id);

    if (!passage) {
      return res.status(404).send("Passage was not found");
    }
    
    res.status(200).send(passage);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.post("/", async (req, res) => {
  try {
    console.log(req.body)

    if (!req.body) {
      return res.status(400).send("No data provided");
    }

    const { text, difficulty, category } = req.body;

    if (!text || !difficulty || !category) {
        return res.status(400).send("All fields are required");
    }

    const passage = await Controller.createPassage({ text, difficulty, category });

    if (!passage) {
      return res.status(404).send("Passage was not created");
    }
    
    res.status(200).send(passage);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
})

router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!req.body) {
      return res.status(400).send("No data provided");
    }
    
    const passage = await Controller.updatePassage(id, req.body);

    if (!passage) {
      return res.status(404).send("Passage was not found and updated");
    }

    res.status(200).send(passage);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const passage = await Controller.deletePassage(id);

    if (!passage) {
      return res.status(404).send("Passage was not found and deleted");
    }

    res.status(200).send(passage);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
})

module.exports = router;