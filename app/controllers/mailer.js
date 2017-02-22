//using sendgrid to send invite mail
// https://github.com/sendgrid/sendgrid-nodejs

const helper = require('sendgrid').mail;
const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);

exports.invite = (req, res) => {
  const gameUrl = req.body.link;
  const invitedUserEmail = req.body.email;
  const fromEmail = new helper.Email('game-invite@izanami-cfh.com');
  const toEmail = new helper.Email(invitedUserEmail);
  const subject = 'Izanami Cards For Humanity Game Invitation ';
  const content = new helper.Content('text/plain', gameUrl);
  mail = new helper.Mail(fromEmail, subject, toEmail, content);

  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  });

  sg.API(request, (error, response) => {
    res.send(response.statusCode);
  });
};