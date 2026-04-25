// index.js — API de demostración con vulnerabilidades intencionadas
// ADVERTENCIA: Este archivo contiene vulnerabilidades de seguridad intencionales
// para demostrar el análisis estático con CodeQL en el curso DevOps.
// NO usar en producción.

const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app = express();
app.use(express.json());

// VULNERABILIDAD DEMO 1: Code Injection (eval)
// CodeQL detectará: js/code-injection
app.get('/calculate', (req, res) => {
    const expression = req.query.expr;
    // eslint-disable-next-line no-eval
    const result = eval(expression);
    res.json({ result });
});

// VULNERABILIDAD DEMO 2: Path Traversal
// CodeQL detectará: js/path-injection
app.get('/files', (req, res) => {
    const filename = req.query.name;
    const filePath = path.join(__dirname, 'data', filename);
    const content  = fs.readFileSync(filePath, 'utf8');
    res.send(content);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de demo escuchando en puerto ${PORT}`);
});
