const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://yaakovab:${password}@cluster0.pb1rd.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    console.log('phonebook:')
    Person
        .find({})
        .then(persons => {
            persons.forEach((person) => {
                console.log(person.name, person.number)
            })
            mongoose.connection.close()
            process.exit(0)
        })
}

else if (process.argv.length === 5) {
    // console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)

    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    })

    person
        .save()
        .then(result => {
            console.log(`added ${result.name} number ${process.argv[4]} to phonebook`)
            mongoose.connection.close()
        })
}
