require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

morgan.token('body', req => {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/', (req, res) => {
    res.send('<h1>Ahoi</h1>')
})

app.get('/api/persons', (req, res) => {
    Person
        .find({})
        .then(persons =>
            res.json(persons))

})

app.get('/info', (req, res, next) => {
    Person.count({})
        .then(result => {
            console.log(result)
            res.send(`Your phonebook has info for ${result} people<br><br>${Date()}`)
        })
        .catch(err => next(err))
})

app.get('/api/persons/:id', (req, res, next) => {

    Person
        .findById(req.params.id)
        .then(entryReturned => {
            if (entryReturned) {
                res.json(entryReturned)
            }
            else {
                res.status(404).end()
            }
        })
        .catch(err => next(err))

})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            console.log(result)
            res.status(204).end()
        })
        .catch(err => next(err))
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body
    console.log(body)

    if (body.name === undefined || body.name === '') {
        return res.status(400).json({ error: 'name must be included' })
    }
    if (body.number === undefined || body.number === '') {
        return res.status(400).json({ error: 'number must be included' })
    }

    Person.find({ name: body.name }).then(result => {
        console.log(result)
    })

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person
        .save()
        .then(personSaved => {
            res.json(personSaved)
            console.log(personSaved.rawResult)
        })
        .catch(err => next(err))
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(err => { next(err) })
})


const unknownEndpoint = (req, res) => {
    console.log('Error occured');
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (err, req, res, next) => {
    console.error(err.message)

    if (err.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id in request' })
    }
    if (err.name === 'ValidationError') {
        return res.status(400).send({ error: err.message })
    }
    if (err.name === 'MongoServerError') {
        return res.status(400).send({ error: err.message })
    }

    next(err)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`server running on port no. ${PORT}`)
})