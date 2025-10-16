use("blasttype")

db.users.updateMany({}, {
    $set: {
        access_level: "admin"
    }
})
