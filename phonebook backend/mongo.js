const mongoose = require('mongoose')
const db = mongoose.connection

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    id: {
        type: String,
        required: true
    }

})
const Contact = mongoose.model('Contact', contactSchema)


if (process.argv.length < 3 ) {
    console.log('password needed')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://flushy85:${password}@clusterg-xn7vq.mongodb.net/note-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

db.once('open', () => console.log('connection enabled to db'))



if(process.argv.length === 5){
    const contact = new Contact({
        name: process.argv[3],
        number: process.argv[4],
        id: Math.round(Math.random() * 1000)
    })

    contact.save()
        .then(result => {
            console.log(`added ${result.name} number ${result.number} to the database!`)
            mongoose.connection.close()
        })
} else if (process.argv.length === 3) {
    Contact.find({}).then(result => {
        result.forEach(contact => {
            console.log(`${contact.name} ${contact.number}`)
        })
        mongoose.connection.close()
    })
} else {
    console.log('missing data to make contact, name and number required')
    mongoose.connection.close()
}