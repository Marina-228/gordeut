const app = require('./server');

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('Deployed on port ${PORT}');
});