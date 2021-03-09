import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, query, validationResult } from 'express-validator'
import fs from 'fs'

const users = require('./db');

const app = express()
app.use(bodyParser.json())
app.use(cors())

const PORT = process.env.PORT || 3000
const SECRET = "SIMPLE_SECRET"

interface JWTPayload {
  username: string;
  password: string;
}

const readDbFile = () => {
  const raw = fs.readFileSync('db.json', 'utf8')
  const db = JSON.parse(raw)
  return db
}

app.post('/login',
  (req, res) => {
    const { username, password } = req.body
    // Use username and password to create token.
    const db = readDbFile();
    const hashPW = bcrypt.hashSync(password,10);
    const user = db.users.filter(() => user.username === username)
    if(bcrypt.compareSync(password,user.password)){
      const token = jwt.sign({
        username: username,
        password: hashPW
      } as JWTPayload,SECRET)
      res.status(200)
      res.json({ message: 'Login succesfully' })
      res.json(token)
      return
    }else{
      return res.status(400).json({
      message: 'Invalid username or password',
    })
    }
  })

app.post('/register',
  (req, res) => {
    const { username, password, firstname, lastname, balance } = req.body
    const db = readDbFile();
    // const user = db.users.filter(person => person.username === username)
    // if(user){
    //   res.status(400)
    //   res.json({
    //     message: 'Username is already in used'
    //   })
    //   return
    // }
    const hashPW = bcrypt.hashSync(password,10);
    db.users.push({
      username: username,
      password: hashPW,
      firstname: firstname,
      lastname: lastname,
      balance: balance,
    })
    fs.writeFileSync('db.json',JSON.stringify(db))
    res.status(200).json({ message: 'Register successfully'})

  })

app.get('/balance',
  (req, res) => {
    const token = req.query.token as string
    try {
      const { username } = jwt.verify(token, SECRET) as JWTPayload
      const db = readDbFile();
      const user = db.users.filter(()=> user.username === username)
      res.status(200)
      res.json({
        name: user.username + " " + user.lastname,
        balance:  user.balance,
      })
    }
    catch (e) {
      //response in case of invalid token
      res.status(401)
      res.json({
        message: 'Invalid token'
      })
    }
  })

app.post('/deposit',
  body('amount').isInt({ min: 1 }),
  (req, res) => {
    //Is amount <= 0 ?
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ message: "Invalid data" })
  })

app.post('/withdraw',
  (req, res) => {
  })

app.delete('/reset', (req, res) => {
  //code your database reset here
  fs.writeFileSync('db.json',JSON.stringify({"users":[]}))
  return res.status(200).json({
    message: 'Reset database successfully'
  })
})

app.get('/me', (req, res) => {
  res.status(200)
  res.json({
    firstname: 'Janitra',
    lastname: 'Chaikird',
    code: 620610781,
    gpa: 3.42
  })
})

app.get('/demo', (req, res) => {
  return res.status(200).json({
    message: 'This message is returned from demo route.'
  })
})

app.listen(PORT, () => console.log(`Server is running at ${PORT}`))