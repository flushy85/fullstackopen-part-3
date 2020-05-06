require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Contact = require('./models/contact')

app.use(express.static('build'))
app.use(bodyParser.json())

app.use(morgan(':method :url :status :reqData'))

app.use(cors())

morgan.token('reqData', function(req, res) {
    return JSON.stringify(req.body)
})

app.get('/', (req, res) => {
    res.send('<h1>hi</h1>')
})

app.get('/api/persons', (req, res) => {
    Contact.find({}).then(contacts => {
        res.json(contacts.map(contact => contact.toJSON()))
    })
})

app.get('/info', (req, res) => {
    let date =  new Date()
    Contact.find({})
        .then(contacts => {
            res.send(`<p>Phonebook has info for ${contacts.length} people</p>${date}`)
        }) 
})

app.get('/api/persons/:id', (req, res, next) => {
    Contact.findById(req.params.id)
        .then(result => {
            res.json(result.toJSON())
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Contact.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})


app.post('/api/persons', (req, res, next) => {
    const body = req.body
    if(!body.name || !body.number){
        return res.status(400).json({
            error: 'content missing'
        })
    }
    
    const contact = new Contact({
        name: body.name, 
        number: body.number 
    })

    contact.save()
        .then(savedContact => {
            res.json(savedContact.toJSON())
            console.log(`${contact.name} added to phonebook`)
        })
        .catch(error => next(error))
    
})

app.put('/api/persons/:id', (req, res) => {
    const contact = req.body
    Contact.findByIdAndUpdate(req.params.id, { name: contact.name, number: contact.number })
        .then(updatedContact => {
            res.json(updatedContact.toJSON())
            console.log(`${contact.name} updated in phonebook`)
        })
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unkown endpoint' })
}

const errorHandler = (err, req, res, next) => {
    console.error(err.message)

    if(err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).send({ error: "malformated id"})
    } else if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message })
    }
    
    next(err)
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})