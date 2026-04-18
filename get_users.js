const mongoose = require('mongoose');
const User = require('./backend/models/user');

const MONGO_URI = 'mongodb://localhost:27017/cinebook';

async function getUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        const users = await User.find({});
        console.log(JSON.stringify(users, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

getUsers();
