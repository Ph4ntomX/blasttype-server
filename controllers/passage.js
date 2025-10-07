let Controller = {}
const Passage = require("../models/schemas").Passage;

Controller.getPassages = async (rawFilter, page = 1, limit = 10) => {
    // pagination implemented

    let filter = {};
    
    if (rawFilter.category) {
      filter.category = rawFilter.category;
    }

    try {
        const passages = await Passage.find(filter).skip((page - 1) * limit).limit(limit);
        return passages;
    } catch (error) {
        return;
    }
}

Controller.getPassageById = async (id) => {
    try {
        const passage = await Passage.findById(id);
        return passage;
    } catch (error) {
        return;
    }
}

Controller.randomPassage = async (rawFilter) => {
    let filter = {};
    
    if (rawFilter.category) {
      filter.category = rawFilter.category;
    }

    try {
        const passage = await Passage.aggregate([
            { $match: filter },
            { $sample: { size: 1 } }
        ]);
        return passage;
    } catch (error) {
        return;
    }
}

Controller.createPassage = async (passage) => {
    try {
        const newPassage = await Passage.create(passage);
        return newPassage;
    } catch (error) {
        return;
    }
}

Controller.updatePassage = async (id, passage) => {
    try {
        const updatedPassage = await Passage.findByIdAndUpdate(id, passage, { new: true });
        return updatedPassage;
    } catch (error) {
        return;
    }
}

Controller.deletePassage = async (id) => {
    try {
        const deletedPassage = await Passage.findByIdAndDelete(id);
        return deletedPassage;
    } catch (error) {
        return;
    }
}

module.exports = Controller;
