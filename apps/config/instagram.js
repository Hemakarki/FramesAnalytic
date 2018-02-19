import Instagram from 'node-instagram';

const Instagram = require('node-instagram').default;

// Your redirect url where you will handle the code param
const redirectUri = 'http://localhost:3000/auth/instagram/callback';

app.get('/auth/instagram', (req, res) => {
    res.redirect(instagram.getAuthorizationUrl(redirectUri, {
       scope: ['basic'],
       state: 'live'}
    ));
});

app.get('/auth/instagram/callback', async (req, res) => {
 try {
   const code = req.query.code;
   const data = await instagram.authorizeUser(code, redirectUri);
   res.json(data);
 } catch (err) {
   res.json(err);
 }
});