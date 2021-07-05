require('dotenv').config()
const axios = require('axios')
const nodemailer = require('nodemailer')

const url = 'https://covid19.min-saude.pt/pedido-de-agendamento/'
const cooldown = 10000 // 10 seconds
const currentAge = 27
let currentMessage = `Tem ${currentAge} ou mais anos e ainda não foi vacinado(a)?`

setInterval(async () => {
  const message = await axios
    .get(url)
    .then(
      ({ data }) =>
        data
          .split('<h3 class="has-text-color" style="color:#026437"><strong>')[1]
          .split('</strong></h3>')[0]
    )
    .catch((e) => console.log(e.request.data))

  if (!message) {
    return
  }

  if (message !== currentMessage) {
    console.log('New message detected: ', message)

    currentMessage = message

    const text = `Beep boop it\'s go time!\n${message}\n\n${url}`

    const mailingList = process.env.MAILING_LIST.split(',')
    for (const to of mailingList) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PW
        }
      })

      const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject: message,
        text
      }

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err)
          return
        }
        console.log(`Email sent to ${to}`)
      })
    }
  }
}, cooldown)
